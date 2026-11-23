import os
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_ENV_FILE = Path(__file__).resolve().parents[4] / ".env"


class Settings(BaseSettings):
    port: int = Field(
        default_factory=lambda: int(os.getenv("AI_PORT") or os.getenv("PORT") or 8000),
        alias="AI_PORT",
    )
    client_url: str = "http://localhost:5173"
    gemini_api_key: str = ""
    openweather_api_key: str = ""
    model: str = "gemini-3.5-flash-lite"
    crowd_api_url: str = ""
    crowd_api_key: str = ""
    transit_api_url: str = ""
    transit_api_key: str = ""

    model_config = SettingsConfigDict(env_file=ROOT_ENV_FILE, extra="ignore", populate_by_name=True)

    @field_validator("model")
    @classmethod
    def use_default_model_when_empty(cls, value: str) -> str:
        return value or "gemini-3.5-flash-lite"


settings = Settings()
