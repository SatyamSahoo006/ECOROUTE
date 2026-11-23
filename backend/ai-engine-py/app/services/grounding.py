from typing import List
from ..schemas.itinerary import (
    Activity,
    Alternative,
    Day,
    ItineraryResponse,
    LocalInfo,
    GenerateRequest,
)

_CATEGORY_KEYWORDS = {
    "heritage": "Heritage",
    "history": "Heritage",
    "historic": "Heritage",
    "fort": "Heritage",
    "monument": "Heritage",
    "temple": "Heritage",
    "nature": "Nature",
    "wildlife": "Nature",
    "trek": "Nature",
    "hiking": "Nature",
    "beach": "Nature",
    "food": "Culture & Food",
    "culture": "Culture & Food",
    "cuisine": "Culture & Food",
    "art": "Culture & Food",
    "market": "Culture & Food",
    "hidden": "Hidden Gems",
    "offbeat": "Hidden Gems",
    "secret": "Hidden Gems",
}
_CATEGORIES = ["Heritage", "Nature", "Culture & Food", "Hidden Gems"]


def _category_for(interest: str) -> str:
    normalized = interest.strip().lower()
    for needle, category in _CATEGORY_KEYWORDS.items():
        if needle in normalized:
            return category
    return "Hidden Gems"


def fallback_itinerary(req: GenerateRequest) -> ItineraryResponse:
    interests = req.interests or _CATEGORIES
    categories: List[str] = []
    for interest in interests:
        category = _category_for(interest)
        if category not in categories:
            categories.append(category)
    if not categories:
        categories = _CATEGORIES

    day_count = 3
    if req.pacing == "relaxed":
        day_count = 2
    elif req.pacing == "packed":
        day_count = 4

    city = req.destination.split(",")[0].strip()
    days: List[Day] = []

    for d in range(1, day_count + 1):
        activities: List[Activity] = []
        for k in range(3):
            category = categories[(d + k) % len(categories)]
            activities.append(
                Activity(
                    title=f"{category} experience in {city}",
                    category=category,
                    shortSummary="Information unavailable — please verify locally.",
                    description="Information unavailable, please verify locally.",
                    status="unverified",
                    confidence=0,
                    capacity=None,
                    crowdPeak=None,
                    crowdBest=None,
                    sensitive=[],
                    local=LocalInfo(gem=False, vendor=None, contribution=0.0),
                    carbonKg=0.0,
                    accessibility=req.accessibilityNeeds or [],
                    alternatives=[],
                    sourceUrl="",
                    lat=0.0,
                    lng=0.0,
                )
            )
        days.append(
            Day(
                day=d,
                title=f"Day {d} — {city}",
                theme=categories[(d - 1) % len(categories)],
                activities=activities,
            )
        )

    return ItineraryResponse(destination=req.destination, days=days)
