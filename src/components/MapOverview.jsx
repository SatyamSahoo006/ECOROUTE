import { motion } from 'framer-motion'
import { useEffect, useState, Suspense, lazy, Component } from 'react'
import { useLang } from '../i18n.jsx'
import { geocodeDestination, spreadPoints } from '../services/geo'
import { fetchRouteEta } from '../services/api.js'
import { buildItineraryStops, decodePolyline } from '../services/route.js'
import { MapPin, Route, TriangleAlert, Navigation, Clock, ExternalLink } from './icons.jsx'

const MapView = lazy(() => import('./MapView'))

// Card-level boundary: if the map library is missing, show the static fallback.
class MapErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: false }
  }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children
  }
}

function buildPoints(itinerary) {
  if (!itinerary?.days) return []
  return itinerary.days.flatMap((d) =>
    d.activities.map((a) => ({
      id: a.id,
      name: a.name,
      capacity: a.capacity,
      confidence: a.confidence,
      source: typeof a.source === 'string' ? a.source : '',
      lat: a.lat,
      lng: a.lng,
      kind: a.capacity >= 80 || (a.sensitive && a.sensitive.length) ? 'flagged' : 'recommended',
    })),
  )
}

function StaticMap({ itinerary }) {
  const points = (() => {
    if (!itinerary?.days) return []
    let n = 0
    return itinerary.days.flatMap((d, di) =>
      d.activities.map((a) => {
        const seed = (di * 17 + n++ * 13 + a.name.length * 7) % 100
        const x = 14 + (seed * 0.72) % 72
        const y = 14 + ((seed * 37) % 72)
        return { id: a.id, label: a.name.replace(/\(.*\)/, '').trim().slice(0, 16), x, y, kind: a.capacity >= 80 ? 'flagged' : 'recommended' }
      }),
    )
  })()
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-emerald-900/30 via-slate-900 to-rose-900/20">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {points.map((p) => (
        <div key={p.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <span className={`relative flex h-3 w-3 ${p.kind === 'flagged' ? 'text-rose-400' : 'text-emerald-400'}`}>
            {p.kind === 'flagged' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />}
            <span className={`relative inline-flex h-3 w-3 rounded-full ${p.kind === 'flagged' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
          </span>
        </div>
      ))}
    </div>
  )
}

export default function MapOverview({ itinerary }) {
  const { t } = useLang()
  const [center, setCenter] = useState(null)
  const [points, setPoints] = useState([])
  const [userPos, setUserPos] = useState(null)
  const [locating, setLocating] = useState(false)
  const [route, setRoute] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)

  const locate = () => {
    if (!('geolocation' in navigator)) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  useEffect(() => {
    let cancelled = false
    const dest = itinerary?.destination || 'India'
    geocodeDestination(dest).then((c) => {
      if (cancelled) return
      if (!c) {
        setCenter(null)
        return
      }
      const base = buildPoints(itinerary)
      const spread = spreadPoints(c, Math.max(base.length, 1))
      setPoints(
        base.map((p, i) => {
          const hasRealCoords =
            Number.isFinite(p.lat) && Number.isFinite(p.lng) && (p.lat !== 0 || p.lng !== 0)
          return {
            ...p,
            lat: hasRealCoords ? p.lat : spread[i].lat,
            lng: hasRealCoords ? p.lng : spread[i].lng,
          }
        }),
      )
      setCenter(c)
    })
    return () => {
      cancelled = true
    }
  }, [itinerary])

  useEffect(() => {
    let cancelled = false
    const stops = buildItineraryStops(itinerary, itinerary?.destination)
    if (stops.length < 2) {
      setRoute(null)
      return undefined
    }
    setRouteLoading(true)
    fetchRouteEta(stops, 'driving')
      .then((data) => {
        if (cancelled) return
        setRoute(data && data.available ? data : null)
      })
      .finally(() => {
        if (!cancelled) setRouteLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [itinerary])

  const routePositions = route?.overviewPolyline ? decodePolyline(route.overviewPolyline) : null

  return (
    <div className="glass p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold text-white">
          <MapPin size={16} className="text-emerald-400" /> {t('map')}
        </h3>
        <div className="flex gap-2 text-[11px]">
          <span className="pill bg-emerald-500/15 text-emerald-300">{t('recommended')}</span>
          <span className="pill bg-rose-500/15 text-rose-300">{t('flagged')}</span>
        </div>
      </div>

      <button
        onClick={locate}
        disabled={locating}
        className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-60"
      >
        <Navigation size={13} /> {locating ? 'Locating…' : 'Locate Me'}
      </button>

      <div className="relative h-72 overflow-hidden rounded-xl border border-white/10">
        {center ? (
          <MapErrorBoundary fallback={<StaticMap itinerary={itinerary} />}>
            <Suspense fallback={<div className="grid h-full w-full place-items-center bg-slate-100 text-sm text-slate-500">Locating destination…</div>}>
              <MapView center={center} points={points} userPos={userPos} routePositions={routePositions} />
            </Suspense>
          </MapErrorBoundary>
        ) : (
          <StaticMap itinerary={itinerary} />
        )}
      </div>

      {(route || routeLoading) && (
        <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-[11px] text-emerald-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <Clock size={13} />
              {routeLoading
                ? 'Calculating Google route ETA…'
                : `Route ETA${route.trafficAware ? ' · live traffic' : ''}`}
            </div>
            {route?.mapsUrl && (
              <a
                href={route.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-300 hover:underline"
              >
                Open in Google Maps <ExternalLink size={11} />
              </a>
            )}
          </div>
          {route && (
            <div className="mt-2 flex flex-wrap gap-3 text-emerald-200/80">
              <span>{route.distance?.text}</span>
              <span>{route.durationInTraffic?.text || route.duration?.text}</span>
              {!route.trafficAware && <span>Standard estimate</span>}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-emerald-300">
          <Route size={13} /> {t('recommended')}
        </div>
        <div className="flex items-center gap-1.5 text-rose-300">
          <TriangleAlert size={13} /> {t('flagged')}
        </div>
      </div>
    </div>
  )
}
