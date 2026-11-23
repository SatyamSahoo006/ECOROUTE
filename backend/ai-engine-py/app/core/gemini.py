from typing import Optional

from .config import settings

_client = None
_types = None

if settings.gemini_api_key:
    try:
        from google import genai
        from google.genai import types

        _client = genai.Client(api_key=settings.gemini_api_key)
        _types = types
    except Exception as e:
        print('[gemini] google-genai unavailable, using fallback itinerary:', e)


def generate_text(system_prompt: str, user_prompt: str) -> Optional[str]:
    if _client is None or _types is None:
        return None
    try:
        response = _client.models.generate_content(
            model=settings.model,
            contents=user_prompt,
            config=_types.GenerateContentConfig(system_instruction=system_prompt),
        )
        return response.text
    except Exception as e:
        print('[gemini] generation failed, using fallback itinerary:', type(e).__name__)
        return None
