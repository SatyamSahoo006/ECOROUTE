import httpx
from ..core.cache import cache_get, cache_set, make_key

_USER_AGENT = "EcoRouteAI/1.0 (contact: http://localhost:5173)"


async def geocode(city: str) -> dict:
    key = make_key("map_coords", city)
    cached = cache_get(key)
    if cached is not None:
        return cached
    result = None
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={"format": "json", "limit": 1, "q": city},
                headers={"Accept": "application/json", "User-Agent": _USER_AGENT},
                timeout=8,
            )
            r.raise_for_status()
            d = r.json()
            hit = d[0] if d else None
            lat = float(hit["lat"]) if hit else None
            lng = float(hit["lon"]) if hit else None
            result = {"lat": lat, "lng": lng} if lat is not None and lng is not None else None
    except Exception:
        result = None
    cache_set(key, result, 10 * 60)
    return result
