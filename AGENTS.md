# AGENTS.md — EcoRoute AI Agent Guide

This file gives AI coding agents the minimum context needed to work safely and effectively in this repo.

## Project Summary

EcoRoute AI is a responsible-travel itinerary copilot (India-focused) with:
- **Frontend**: React 18 + Vite + Tailwind (`src/`)
- **Gateway**: Express + TypeScript + MongoDB/JWT (`backend/gateway-ts/`)
- **AI Engine**: FastAPI + Pydantic + Gemini (`backend/ai-engine-py/`)

Request flow: `Browser (:5173) -> Gateway /api (:5000) -> AI Engine /py (:8000) -> external APIs`.

## Folder Structure & Responsibilities

```text
/
├── .env.example                 # Single root env template for all services
├── README.md                    # Project docs (keep in sync with code/env/schema changes)
├── AGENTS.md                    # This guide/rules
├── package.json, vite.config.js # Frontend build/dev config
├── start-all.bat                # Windows launcher: MongoDB + AI + Gateway + Frontend
├── src/                         # React frontend
│   ├── App.jsx, main.jsx        # App bootstrap/composition
│   ├── components/              # UI screens/widgets (landing, dashboard, map, auth, itinerary)
│   ├── context/AuthContext.jsx  # Auth/token state; calls gateway auth endpoints
│   ├── services/api.js          # Itinerary generation + live/media/route helpers; offline fallback
│   ├── services/geo.ts          # Geocoding/spreading helpers for map
│   ├── services/route.js        # Itinerary stop building + Google polyline decoding
│   └── data/                    # Static data
└── backend/
    ├── ai-engine-py/            # FastAPI AI engine
    │   ├── requirements.txt
    │   └── app/
    │       ├── main.py              # FastAPI app, CORS, /health, /py routers
    │       ├── api/                 # generate.py, live_status.py, geocode.py
    │       ├── schemas/itinerary.py # CANONICAL response/request schema
    │       ├── prompts/system.py    # Gemini prompt; must match schema
    │       ├── services/            # grounding fallback, weather, overcrowding, geocode
    │       └── core/                # env config, Gemini client, in-memory cache
    └── gateway-ts/              # Express API gateway
        ├── package.json
        └── src/
            ├── app.ts               # Express app, CORS, routes, /health
            ├── config/env.ts        # Env loading/defaults
            ├── routes/              # auth, itinerary, media, geocode, traffic
            ├── controllers/         # handlers; itinerary normalization
            ├── services/            # python proxy, maps routes, email, google auth
            ├── middleware/          # auth guard, rate limit, error handler
            ├── models/              # Mongoose models + repo helpers
            └── cache.ts             # TTL cache
```

## Architecture / Runtime

| Service | Port | Entry | Key Endpoints |
|---|---:|---|---|
| Frontend (Vite) | 5173 | `src/main.jsx` | UI calls gateway (`VITE_API_BASE`) |
| Gateway (Express) | 5000 | `backend/gateway-ts/src/app.ts` | `/api/auth/*`, `/api/itinerary/*`, `/api/routes/*`, `/api/media/*`, `/api/geocode`, `/health` |
| AI Engine (FastAPI) | 8000 | `backend/ai-engine-py/app/main.py` | `/py/generate`, `/py/live-status`, `/py/geocode`, `/health` |

External integrations: Gemini, Google Directions/Maps, Unsplash, OpenWeather, Nominatim, Google OAuth, SMTP email.

## Critical Rules (Do Not Violate)

1. **Secrets safety**
   - NEVER read, print, log, or expose values from any `.env` file.
   - Use root `.env.example` only for variable names/docs; root `.env` is the sole runtime env file.
   - Never hardcode secrets/API keys/tokens. Keep `.env` ignored.

2. **Schema ownership**
   - **Canonical schema is Python**: `backend/ai-engine-py/app/schemas/itinerary.py`.
   - If schema changes: update `backend/ai-engine-py/app/prompts/system.py` and gateway normalizer (`backend/gateway-ts/src/controllers/itinerary.controller.ts`) in the same change.
   - Gateway may add safe `??` fallbacks for missing optional fields, but must NOT overwrite real AI values with hardcoded constants.

3. **README maintenance**
   - After changes to code, schemas, routes, scripts, or env vars, patch `README.md` in the same session.
   - Keep these sections current: Architecture, API/contracts summary, Environment Variables, Run Instructions, Tech Stack, Folder/Status notes as applicable.

4. **Change discipline**
   - Prefer small, targeted fixes; follow existing patterns.
   - Do not commit unless explicitly asked.
   - Before finishing, run relevant lint/typecheck/build commands if discoverable; if not, report what was run.

## Setup Commands (Quick Reference)

```bat
:: Install
npm install
cd backend\gateway-ts && npm install
cd ..\ai-engine-py && python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt

:: Run all (Windows)
start-all.bat

:: Or run individually
mongod --dbpath "%CD%\backend\gateway-ts\data"
cd backend\ai-engine-py && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000
cd backend\gateway-ts && npm run dev
npm run dev
```

## Known Gotchas

- Frontend has offline/local fallback itinerary generation in `src/services/api.js`; backend failures may not surface as hard UI failures.
- Gateway caches itinerary/media/geocode responses (TTL-based in-memory cache).
- Live status is proxied through gateway (`/api/itinerary/live-status`) and requires auth token.
- Route ETAs are proxied through gateway (`POST /api/routes/route`) to keep `GOOGLE_MAPS_API_KEY` server-side; without the key the UI falls back to standard estimates.
- Email verification uses `${CLIENT_URL}/verify-email?token=...`; frontend handles token and calls gateway verify endpoint.
- AI engine returns fallback itinerary when Gemini key/model/output fails; this is intentional for resilience.
- Provenance must stay honest: offline-generated activities are `unverified`; `LIVE` is shown only when OpenWeather, a live crowd provider, and a live transit feed all return data. Capacity is `unavailable` until a crowd provider is configured.
- Live transit uses India GTFS-Realtime by default; `CROWD_API_KEY` alone enables BestTime live crowd. `CROWD_API_URL` / `TRANSIT_API_URL` are optional overrides for other providers.
- Both backends load root `.env` explicitly; `GATEWAY_PORT` and `AI_PORT` keep their ports distinct. Only root `.env` and root `.env.example` exist.
- Gateway returns `confidence` as 0–100; do not clamp it to 0–1 in frontend/backends.
- Google sign-in is fail-closed: no simulated tokens; missing `GOOGLE_CLIENT_ID` disables the button.
- VS Code/Pyrefly uses `backend/ai-engine-py/pyrefly.toml` and `.vscode/settings.json` to resolve the AI venv; reload the window if editor import errors persist.
