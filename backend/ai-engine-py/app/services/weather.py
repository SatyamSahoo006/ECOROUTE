import httpx
from ..core.config import settings
from ..core.cache import cache_get, cache_set, make_key

_FALLBACK = {"temp": 29, "condition": "Partly cloudy", "humidity": 64, "wind": 11, "alert": None, "source": "fallback"}
_USER_AGENT = "EcoRouteAI/1.0"


async def get_weather(city: str) -> dict:
    key = make_key("weather", city)
    cached = cache_get(key)
    if cached is not None:
        return cached
    if not settings.openweather_api_key:
        cache_set(key, _FALLBACK)
        return _FALLBACK
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"q": city, "appid": settings.openweather_api_key, "units": "metric"},
                headers={"User-Agent": _USER_AGENT},
                timeout=10,
            )
            r.raise_for_status()
            d = r.json()
            result = {
                "temp": d["main"]["temp"],
                "condition": d["weather"][0]["main"],
                "humidity": d["main"]["humidity"],
                "wind": d["wind"]["speed"],
                "alert": None,
                "source": "openweather",
            }
            cache_set(key, result, 10 * 60)
            return result
    except Exception:
        cache_set(key, _FALLBACK, 10 * 60)
        return _FALLBACK
