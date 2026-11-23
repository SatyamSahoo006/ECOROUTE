import datetime
import hashlib
from urllib.parse import quote, urlparse

import httpx

from ..core.config import settings

_DEFAULT_URL = "https://besttime.app/api/v1/forecasts/live"
_TTL_SECONDS = 60
_cache = {}


def _clamp(value) -> int:
    return max(0, min(100, int(round(float(value)))))


def _first_value(containers, keys):
    for container in containers:
        if not isinstance(container, dict):
            continue
        for key in keys:
            value = container.get(key)
            if value is not None and value != "":
                return value
    return None


def _extract_capacity(payload: dict, besttime: bool):
    analysis = payload.get("analysis") if isinstance(payload.get("analysis"), dict) else {}
    data = payload.get("data") if isinstance(payload.get("data"), dict) else {}
    containers = (analysis, payload, data)

    if besttime:
        if str(payload.get("status", "")).upper() != "OK":
            return None, "unavailable"
        live = analysis.get("venue_live_busyness")
        if analysis.get("venue_live_busyness_available") is True and live is not None:
            return _clamp(live), "provider-live"
        forecast = analysis.get("venue_forecasted_busyness")
        if analysis.get("venue_forecast_busyness_available") is True and forecast is not None:
            return _clamp(forecast), "provider-forecast"
        return None, "unavailable"

    live = _first_value(containers, ("venue_live_busyness", "current_busyness", "busyness", "occupancy"))
    if live is not None:
        return _clamp(live), "provider-live"

    forecast = _first_value(containers, ("venue_forecast_busyness", "forecast_busyness"))
    if forecast is not None:
        return _clamp(forecast), "provider-forecast"

    current = _first_value((payload, data), ("current_count", "people", "count"))
    limit = _first_value((payload, data), ("overcrowding_limit", "limit", "capacity_limit"))
    if current is not None and limit:
        return _clamp(float(current) / float(limit) * 100), "provider-count"

    return None, "unavailable"


def _safe_url(url: str) -> str:
    key = settings.crowd_api_key
    if key:
        return url.replace(quote(key), "***").replace(key, "***")
    return url


def _unavailable(reason: str, source_url=None) -> dict:
    return {
        "available": False,
        "capacity": None,
        "capacitySource": "unavailable",
        "source": "none",
        "sourceUrl": source_url,
        "capturedAt": None,
        "reason": reason,
    }


def _now_iso() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")


async def get_crowd(destination: str) -> dict:
    template = settings.crowd_api_url.strip()
    is_besttime = False
    if not template and settings.crowd_api_key:
        template = _DEFAULT_URL
        is_besttime = True
    if not template:
        return _unavailable("no live crowd provider configured")

    if "besttime.app" in urlparse(template).netloc:
        is_besttime = True

    venue = destination.split(",")[0].strip()
    key = settings.crowd_api_key
    url = template.replace("{destination}", quote(destination)).replace("{venue}", quote(venue))
    url = url.replace("{key}", quote(key) if key else "")

    headers = {}
    params = {}
    if is_besttime:
        if not key:
            return _unavailable("BestTime live crowd feed needs CROWD_API_KEY", _safe_url(url))
        params = {
            "api_key_private": key,
            "venue_name": venue,
            "venue_address": destination,
        }
    else:
        params["destination"] = destination
        if key:
            headers["Authorization"] = "Bearer " + key
            headers["X-API-Key"] = key
            params["api_key"] = key

    cache_key = hashlib.sha256((url + repr(sorted(params.items()))).encode("utf-8")).hexdigest()
    now = datetime.datetime.now(datetime.timezone.utc).timestamp()
    cached = _cache.get(cache_key)
    if cached and now - cached[0] < _TTL_SECONDS:
        return cached[1]

    try:
        async with httpx.AsyncClient() as client:
            if is_besttime:
                response = await client.post(url, params=params, timeout=10)
            else:
                response = await client.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            payload = response.json()

        capacity, source = _extract_capacity(payload, is_besttime)
        if capacity is None or source not in ("provider-live", "provider-count"):
            result = _unavailable("crowd provider returned no live occupancy value", _safe_url(url))
            if source == "provider-forecast":
                result["reason"] = "provider returned forecast only, not live occupancy"
                result["capacitySource"] = source
        else:
            result = {
                "available": True,
                "capacity": capacity,
                "capacitySource": source,
                "source": urlparse(url).netloc,
                "sourceUrl": _safe_url(url),
                "capturedAt": _now_iso(),
                "reason": None,
            }
    except Exception as exc:
        result = _unavailable("live crowd feed unavailable: " + type(exc).__name__, _safe_url(url))

    _cache[cache_key] = (now, result)
    return result
