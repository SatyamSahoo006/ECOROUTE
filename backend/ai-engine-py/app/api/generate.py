import json
import re
from fastapi import APIRouter
from ..schemas.itinerary import GenerateRequest, ItineraryResponse
from ..core.gemini import generate_text
from ..core.cache import cache_get, cache_set, make_key
from ..prompts.system import SYSTEM_PROMPT
from ..services.grounding import fallback_itinerary

router = APIRouter()


def _extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in model response")
    return json.loads(match.group(0))


async def generate_itinerary(req: GenerateRequest) -> ItineraryResponse:
    key = make_key("itinerary", req.model_dump(exclude={"user"}))
    cached = cache_get(key)
    if cached is not None:
        return cached

    result: ItineraryResponse
    try:
        user_prompt = f"""
Destination: {req.destination}
Travel dates: {req.dates or 'flexible'}
Budget: {req.budget or 'moderate'}
Pacing: {req.pacing or 'normal'}
Interests: {', '.join(req.interests) if req.interests else 'general'}
Accessibility needs: {', '.join(req.accessibilityNeeds) if req.accessibilityNeeds else 'none'}
Local-only (community-owned venues preferred): {req.localOnly}
Additional requests: {req.requests or 'none'}
"""
        text = generate_text(SYSTEM_PROMPT, user_prompt)
        if not text:
            result = fallback_itinerary(req)
        else:
            data = _extract_json(text)
            result = ItineraryResponse(**data)
    except Exception as e:
        print('[generate] invalid model response, using fallback itinerary:', type(e).__name__)
        result = fallback_itinerary(req)

    cache_set(key, result)
    return result


@router.post("/generate")
async def generate(req: GenerateRequest) -> ItineraryResponse:
    return await generate_itinerary(req)
