from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class LocalInfo(BaseModel):
    gem: bool = False
    vendor: Optional[str] = None
    contribution: float = 0.0


class Alternative(BaseModel):
    name: str
    distance: Optional[str] = None
    travel: Optional[str] = None
    interest: Optional[str] = None


class Activity(BaseModel):
    title: str
    category: Literal["Heritage", "Nature", "Culture & Food", "Hidden Gems"]
    shortSummary: str
    description: str = ""
    lat: float = 0.0
    lng: float = 0.0
    sourceUrl: str = ""
    status: Literal["unverified"] = "unverified"
    confidence: int = Field(default=0, ge=0, le=100)
    capacity: Optional[int] = Field(default=None, ge=0, le=100)
    crowdPeak: Optional[str] = None
    crowdBest: Optional[str] = None
    sensitive: List[str] = Field(default_factory=list)
    local: LocalInfo = Field(default_factory=LocalInfo)
    carbonKg: float = 0.0
    accessibility: List[str] = Field(default_factory=list)
    alternatives: List[Alternative] = Field(default_factory=list)


class Day(BaseModel):
    day: int
    title: str
    theme: str = ""
    activities: List[Activity] = Field(default_factory=list)


class ItineraryResponse(BaseModel):
    destination: str
    days: List[Day] = Field(default_factory=list)


class GenerateRequest(BaseModel):
    destination: str
    dates: Optional[str] = None
    budget: Optional[str] = None
    pacing: Optional[str] = None
    interests: List[str] = Field(default_factory=list)
    accessibilityNeeds: List[str] = Field(default_factory=list)
    localOnly: bool = False
    requests: Optional[str] = None
    user: Optional[dict] = None
