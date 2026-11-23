# EcoRoute AI

Source-aware generative-AI destination copilot for responsible travel planning across India, with dynamic itineraries, Google route ETAs, capacity estimates, and local-impact signals.

## Project Overview

EcoRoute AI is a full-stack monorepo:
- **Frontend (React + Vite)**: trip planning UI, auth flows, itinerary/results dashboard, maps, and live-condition views.
- **Gateway (Express + TypeScript)**: auth, JWT protection, itinerary orchestration, media/geocode proxies, MongoDB persistence.
- **AI Engine (FastAPI + Python)**: Gemini-backed itinerary generation with schema validation, fallback grounding, live weather/status, and geocoding.

Core flow: Browser → Gateway `/api/*` → Python `/py/*` (+ external APIs) → normalized response to frontend.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS, Framer Motion, Leaflet / React-Leaflet, Lucide React |
| Gateway | Node.js, Express 4, TypeScript, Mongoose, JWT (`jsonwebtoken`), Zod, Axios, Nodemailer, Google Auth Library |
| AI Engine | Python 3.11+, FastAPI, Uvicorn, Pydantic v2, `google-genai`, httpx, python-dotenv |
| Database | MongoDB (local or remote via `MONGO_URI`) |
| External APIs | Google Gemini, Google Directions/Maps, Unsplash, OpenWeather, Nominatim (OSM), Google OAuth |

## Architecture

```text
Browser (React 18 + Vite :5173)
  │  REST + JWT Bearer
  ▼
Gateway (Express/TypeScript :5000)
  ├── POST /api/auth/*              → MongoDB (users, JWT, Google OAuth)
  ├── POST /api/itinerary/generate  → Python AI Engine + Unsplash
  ├── GET  /api/itinerary/user      → MongoDB (saved itineraries)
  ├── POST /api/itinerary/save      → MongoDB
  ├── POST /api/routes/route        → Google Directions route + traffic-aware ETA
  ├── GET  /api/media/image         → Unsplash proxy (cached)
  └── GET  /api/geocode?q=          → Nominatim proxy (cached)
        │  POST /py/generate (60s timeout)
        ▼
AI Engine (FastAPI/Python :8000)
  ├── POST /py/generate     → Gemini → validated ItineraryResponse (fallback on failure)
  ├── GET  /py/live-status  → OpenWeather + BestTime crowd + India GTFS-Realtime transit
  └── GET  /py/geocode      → Nominatim
```

## Folder Structure

```text
/
├── .env.example                 # Single root env template for all services
├── AGENTS.md                    # Agent rules and codebase guide
├── README.md                    # This file
├── package.json                 # Frontend scripts/deps
├── vite.config.js               # Vite config (port 5173)
├── start-all.bat                # Windows one-shot launcher
├── src/                         # React frontend
│   ├── App.jsx, main.jsx        # App entry/composition
│   ├── components/              # UI, dashboard, map, auth, itinerary components
│   ├── context/AuthContext.jsx  # Auth state, token persistence, API calls
│   ├── services/                # api.js, geo.ts
│   └── data/                    # Static/demo data
└── backend/
    ├── ai-engine-py/            # FastAPI AI engine
    │   ├── requirements.txt
    │   └── app/
    │       ├── main.py          # FastAPI app, CORS, routers
    │       ├── api/             # generate.py, live_status.py, geocode.py
    │       ├── schemas/         # itinerary.py (canonical schema)
    │       ├── prompts/         # system.py (Gemini prompt)
    │       ├── services/        # grounding/weather/overcrowding/geocode
    │       └── core/            # config.py, gemini.py, cache.py
    └── gateway-ts/              # Express gateway
        ├── package.json
        └── src/
            ├── app.ts           # Express app, CORS, routes, health
            ├── config/          # env.ts, db.ts
            ├── routes/          # auth/itinerary/media/geocode/traffic routes
            ├── controllers/     # request handlers, itinerary normalization
            ├── services/        # python, maps, email, google services
            ├── middleware/      # auth, rate limit, error handler
            ├── models/          # User, Itinerary, repo
            └── cache.ts         # TTL cache
```

## Environment Variables

> One root `.env` is the single source of truth for frontend, gateway, and AI engine. Never commit it.
> Backend `.env` files are ignored; edit only the root `.env`.

Copy `.env.example` to `.env` and fill real values locally. Both backends load this root file explicitly, independent of their working directory.

| Variable | Used by | Purpose | Default/Example |
|---|---|---|---|
| `VITE_API_BASE` | Frontend | Gateway base URL | `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Google OAuth client ID (public) | empty |
| `VITE_DEMO_MODE` | Frontend | Demo UI hints | `false` |
| `GATEWAY_PORT` | Gateway | Gateway listen port | `5000` |
| `MONGO_URI` | Gateway | MongoDB connection string | `mongodb://localhost:27017/ecoroute` |
| `JWT_SECRET` | Gateway | JWT signing secret | empty |
| `PYTHON_AI_SERVICE_URL` | Gateway | AI engine base URL | `http://localhost:8000` |
| `UNSPLASH_ACCESS_KEY` | Gateway | Unsplash image proxy | empty |
| `GOOGLE_MAPS_API_KEY` | Gateway | Google Directions key for live routes/ETAs | empty |
| `GOOGLE_CLIENT_ID` | Gateway | Google OAuth ID-token verification | empty |
| `EMAIL_SERVICE` | Gateway | Nodemailer service | `gmail` |
| `EMAIL_USER` | Gateway | Sender email account | empty |
| `EMAIL_PASS` | Gateway | SMTP app password | empty |
| `CLIENT_URL` | Gateway | Frontend URL for CORS/email links | `http://localhost:5173` |
| `AI_PORT` | AI Engine | FastAPI listen port | `8000` |
| `GEMINI_API_KEY` | AI Engine | Gemini generation key | empty |
| `OPENWEATHER_API_KEY` | AI Engine | OpenWeather live conditions | empty |
| `MODEL` | AI Engine | Gemini model override; empty falls back to `gemini-3.5-flash-lite` | `gemini-3.5-flash-lite` |
| `CROWD_API_URL` | AI Engine | Live crowd endpoint; empty defaults to BestTime when `CROWD_API_KEY` is set | empty |
| `CROWD_API_KEY` | AI Engine | BestTime private key for live foot traffic; key alone is sufficient | empty |
| `TRANSIT_API_URL` | AI Engine | Live GTFS-Realtime status endpoint; empty uses India GTFS default | empty |
| `TRANSIT_API_KEY` | AI Engine | Optional key for custom transit feed | empty |

## Setup & Run

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB running locally (or reachable `MONGO_URI`)
- API keys as needed (Gemini/Unsplash/OpenWeather/Google) for full functionality

### 1) Configure environment
```bat
copy .env.example .env
```
Fill in secrets/keys in the root `.env` only.

### 2) Install dependencies
```bat
npm install
cd backend\gateway-ts && npm install
cd ..\ai-engine-py && python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt
```

### 3) Run (Windows, one-shot)
From repo root:
```bat
run.bat
```
Installs frontend/gateway/AI dependencies, then launches MongoDB (if available), AI engine, gateway, and frontend.

After dependencies are installed, use:
```bat
start-all.bat
```
It launches the services without reinstalling. It skips ports already in use and warns if `mongod` is missing (gateway then uses its in-memory store).

### 4) Run manually
```bat
:: Terminal 1 - MongoDB (optional; gateway falls back to memory)
mongod --dbpath "%CD%\backend\gateway-ts\data"

:: Terminal 2 - AI Engine
cd backend\ai-engine-py
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000

:: Terminal 3 - Gateway
cd backend\gateway-ts
node node_modules\ts-node\dist\bin.js src/app.ts

:: Terminal 4 - Frontend
node node_modules\vite\bin\vite.js --host --port 5173
```

### Service URLs
| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Gateway | http://localhost:5000 (`/health`) |
| AI Engine | http://localhost:8000 (`/health`) |

## API Summary

### Gateway (`:5000`)
- `POST /api/auth/register` - register user, sends verification email
- `GET /api/auth/verify-email?token=` - verify email token
- `POST /api/auth/login` - login, returns JWT + user
- `POST /api/auth/google` - Google ID token login
- `POST /api/itinerary/generate` - auth required; generates itinerary via AI engine, enriches with Unsplash
- `POST /api/itinerary/save` - auth required; save itinerary
- `GET /api/itinerary/user` - auth required; list user itineraries
- `GET /api/itinerary/live-status?destination=` - auth required; proxies live weather, crowd, and transit from AI engine
- `POST /api/routes/route` - auth required; accepts `{ stops, mode }`, returns Google Directions distance, duration, traffic-aware ETA, route polyline, and a Google Maps URL
- `GET /api/media/image?query=` - Unsplash image proxy (cached)
- `GET /api/geocode?q=` - Nominatim geocode proxy (cached)
- `GET /health` - health check

### AI Engine (`:8000`, prefixed `/py`)
- `POST /py/generate` - generate validated itinerary (`ItineraryResponse`)
- `GET /py/live-status?destination=` - weather, crowd, and transit snapshot with `weatherSource`, `capacitySource`, `crowd`, `transit`, and `simulated` metadata
- `GET /py/geocode?city=` - geocode city
- `GET /health` - health check

## Notes / Guardrails

- Python schema is canonical: `backend/ai-engine-py/app/schemas/itinerary.py`. Gateway normalizes/forwards; it should not overwrite real AI values with hardcoded constants.
- Email verification links point to `${CLIENT_URL}/verify-email?token=...`; frontend handles token verification on load.
- Live conditions are fetched via gateway (`/api/itinerary/live-status`) to keep AI engine calls behind auth/rate limits.
- Route ETAs are fetched via gateway (`POST /api/routes/route`) so the Google Maps key stays server-side. Without `GOOGLE_MAPS_API_KEY`, the endpoint reports `available: false` and the UI falls back to standard estimates.
- Gateway normalizes AI-provided `lat`/`lng` from the canonical schema; frontend uses them for route stops and landmark directions when available.
- Frontend includes save/list itinerary wiring against gateway endpoints.
- The AI engine has a fallback itinerary builder when Gemini is unavailable or output is invalid.
- Provenance labels are intentional: offline-generated itineraries are `unverified`; the `LIVE` badge is shown only when OpenWeather, a live crowd provider, and a live transit feed all return data. Capacity is `unavailable` until `CROWD_API_KEY` is configured.
- Real-time sources activate via `GEMINI_API_KEY`, `GOOGLE_MAPS_API_KEY`, `OPENWEATHER_API_KEY`, `UNSPLASH_ACCESS_KEY`, and `CROWD_API_KEY`. Transit uses India GTFS-Realtime by default; `CROWD_API_URL` / `TRANSIT_API_URL` can override providers.
- Root `.env` is gitignored and is the only runtime env file; root `.env.example` is the only env template.
- Gateway `confidence` is returned as a 0–100 percentage to match the canonical AI schema and frontend bars.
- VS Code/Pyrefly resolves the AI engine through `backend/ai-engine-py/pyrefly.toml` and `.vscode/settings.json`, both pointing at `backend/ai-engine-py/.venv/Scripts/python.exe`.
- In development, gateway CORS also accepts `localhost`, `127.0.0.1`, and private-LAN origins on ports `5173`/`5174`; production still uses `CLIENT_URL` only.
- Google sign-in `origin_mismatch` is a Cloud Console configuration issue: add the exact frontend origin (for example `http://localhost:5173` and `http://127.0.0.1:5173`) under the OAuth client's Authorized JavaScript origins.
