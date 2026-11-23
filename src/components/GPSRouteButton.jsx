import { useState } from 'react'
import { fetchRouteEta } from '../services/api.js'
import { Navigation, MapPin } from './icons.jsx'

function haversineKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export default function GPSRouteButton({ place }) {
  const [state, setState] = useState({
    loading: false,
    distance: null,
    etaText: null,
    trafficAware: false,
    error: null,
  })
  if (!place?.coords) return null

  const handleClick = () => {
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported on this device.' }))
      return
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        const fallbackKm = haversineKm(here, place.coords)
        const fallbackEta = Math.max(1, Math.round((fallbackKm / 40) * 60))
        const url = `https://www.google.com/maps/dir/?api=1&origin=${here.lat},${here.lng}&destination=${place.coords.lat},${place.coords.lng}&travelmode=driving`
        window.open(url, '_blank', 'noopener')
        setState({
          loading: false,
          distance: fallbackKm,
          etaText: `~${fallbackEta} min drive`,
          trafficAware: false,
          error: null,
        })

        const stops = [
          { name: 'You', lat: here.lat, lng: here.lng },
          { name: place.name || 'Destination', lat: place.coords.lat, lng: place.coords.lng },
        ]
        fetchRouteEta(stops, 'driving')
          .then((route) => {
            if (!route?.available || !route.distance?.value) return
            setState((s) => ({
              ...s,
              distance: route.distance.value / 1000,
              etaText: route.durationInTraffic?.text || route.duration?.text || s.etaText,
              trafficAware: !!route.durationInTraffic,
            }))
          })
          .catch(() => {})
      },
      (err) => {
        setState({
          loading: false,
          distance: null,
          etaText: null,
          trafficAware: false,
          error: err.code === 1 ? 'Location permission denied.' : 'Could not get your location.',
        })
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={state.loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60"
      >
        <Navigation size={16} />
        {state.loading ? 'Locating you…' : 'Get Google Maps Route & ETA'}
      </button>
      {state.distance != null && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-emerald-700">
          <MapPin size={13} /> ~{state.distance.toFixed(1)} km away
          {state.etaText && (
            <span className="text-slate-500">
              · {state.trafficAware ? `Google traffic ETA ${state.etaText}` : state.etaText}
            </span>
          )}
        </div>
      )}
      {state.error && <p className="text-center text-xs text-rose-600">{state.error}</p>}
    </div>
  )
}
