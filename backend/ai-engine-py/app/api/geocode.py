# pyrefly: ignore[missing-import]
from fastapi import APIRouter, Query
# pyrefly: ignore[missing-import]
from ..services.geocode import geocode

router = APIRouter()


@router.get("/geocode")
async def geo(city: str = Query(...)):
    return await geocode(city)
