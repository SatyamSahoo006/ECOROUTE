import time
from urllib.parse import quote

import httpx

from ..core.config import settings

_DEFAULT_URL = "https://maps.reclaim.city/{network}/rt/status.json"
_NETWORKS = (
    ("delhi", "delhi"),
    ("new delhi", "delhi"),
    ("mumbai", "mumbai"),
    ("bengaluru", "bengaluru"),
    ("bangalore", "bengaluru"),
    ("chennai", "mapsv2"),
    ("hyderabad", "tgsrtc"),
    ("telangana", "tgsrtc"),
    ("chandigarh", "tricity"),
    ("gurugram", "gurugram"),
    ("haryana", "hr"),
    ("visakhapatnam", "apsrtc"),
    ("andhra pradesh", "apsrtc"),
    ("odisha", "osrtc"),
)
_TTL_SECONDS = 30
_cache = {}


def _network_for(city: str):
    normalized = city.strip().lower()
    for needle, network in _NETWORKS:
        if needle in normalized:
            return network
    return None


def _safe_url(url: str) -> str:
    key = settings.transit_api_key
    if key:
        return url.replace(quote(key), "***").replace(key, "***")
    return url


def _unavailable(reason: str, network=None, source_url=None) -> dict:
    return {
        "available": False,
        "network": network,
        "source": "none",
        "sourceUrl": source_url,
        "vehicles": None,
        "onTrip": None,
        "tripUpdates": None,
        "feedAgeSeconds": None,
        "notes": [],
        "reason": reason,
    }


async def get_transit(city: str) -> dict:
    network = _network_for(city)
    template = settings.transit_api_url.strip() or _DEFAULT_URL
    if not network and "{network}" in template:
        return _unavailable("no live transit network mapping for this destination")

    url = template.replace("{network}", network or "").replace("{destination}", quote(city))
    if settings.transit_api_key:
        url = url.replace("{key}", quote(settings.transit_api_key))

    now = time.time()
    cached = _cache.get(url)
    if cached and now - cached[0] < _TTL_SECONDS:
        return cached[1]

    headers = {}
    if settings.transit_api_key:
        headers["Authorization"] = "Bearer " + settings.transit_api_key
        headers["X-API-Key"] = settings.transit_api_key

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()

        vehicles = int(data.get("vehicles") or 0)
        on_trip = int(data.get("on_trip") or 0)
        trip_updates = int(data.get("trip_updates") or 0)
        feed_time = int(data.get("feed_time") or 0)
        feed_age = max(0, int(now - feed_time)) if feed_time else None
        fresh = feed_age is not None and feed_age <= 900
        available = fresh and vehicles > 0

        notes = [
            {
                "id": "fleet",
                "text": "%d live vehicles reported" % vehicles,
                "severity": "ok" if vehicles else "warn",
            },
            {
                "id": "trips",
                "text": "%d vehicles matched to live trips" % on_trip,
                "severity": "ok" if on_trip else "warn",
            },
        ]
        if feed_age is not None:
            notes.append(
                {
                    "id": "freshness",
                    "text": "Feed data %ds old" % feed_age,
                    "severity": "ok" if fresh else "warn",
                }
            )

        result = {
            "available": available,
            "network": data.get("network") or network,
            "source": "reclaim-odp",
            "sourceUrl": _safe_url(url),
            "vehicles": vehicles,
            "onTrip": on_trip,
            "tripUpdates": trip_updates,
            "feedAgeSeconds": feed_age,
            "notes": notes,
            "reason": None if available else "feed stale or empty",
        }
    except Exception as exc:
        result = _unavailable("live transit feed unavailable: " + type(exc).__name__, network, _safe_url(url))

    _cache[url] = (now, result)
    return result
