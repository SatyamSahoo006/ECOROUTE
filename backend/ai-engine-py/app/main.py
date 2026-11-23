from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import generate, live_status, geocode
from .core.config import settings

app = FastAPI(title="EcoRoute AI — Verification Engine", version="1.0.0")

ALLOWED_ORIGINS = list(
    dict.fromkeys(
        [
            settings.client_url,
            "http://localhost:5173",
            "http://localhost:5174",
            "https://localhost:5173",
        ]
    )
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/py")
app.include_router(live_status.router, prefix="/py")
app.include_router(geocode.router, prefix="/py")


@app.get("/health")
def health():
    return {"ok": True, "service": "ai-engine-py"}
