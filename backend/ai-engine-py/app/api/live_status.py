import asyncio
import datetime
from fastapi import APIRouter, Query
from ..services.weather import get_weather
from ..services.crowd import get_crowd
from ..services.transit import get_transit

router = APIRouter()


@router.get("/live-status")
async def live_status(destination: str = Query(...)):
    city = destination.split(",")[0].strip()
    weather, crowd, transit = await asyncio.gather(
        get_weather(city),
        get_crowd(destination),
        get_transit(destination),
    )
    weather_source = weather.get("source", "unknown")
    capacity = crowd.get("capacity")
    capacity_source = crowd.get("capacitySource", "unavailable")
    live_weather = weather_source == "openweather"
    live_crowd = capacity_source in ("provider-live", "provider-count")
    live_transit = transit.get("available") is True
    live_sources = {"weather": live_weather, "crowd": live_crowd, "transit": live_transit}
    return {
        "destination": destination,
        "city": city,
        "weather": weather,
        "weatherSource": weather_source,
        "siteCapacity": capacity,
        "capacitySource": capacity_source,
        "crowd": crowd,
        "transit": transit,
        "isOvercrowded": bool(live_crowd and capacity is not None and capacity > 80),
        "liveSources": live_sources,
        "simulated": not all(live_sources.values()),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
    }
