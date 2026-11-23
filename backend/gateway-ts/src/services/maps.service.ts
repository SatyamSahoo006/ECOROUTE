import axios from 'axios'
import { env } from '../config/env'
import { cacheGet, cacheSet } from '../cache'

export type TravelMode = 'driving' | 'walking' | 'bicycling' | 'transit'

export type RouteStopInput =
  | string
  | { name?: string; query?: string; address?: string; lat?: number; lng?: number }

type NormalizedStop = { label: string; value: string }
type TextValue = { text: string; value: number }
type Leg = {
  from: string
  to: string
  startAddress: string
  endAddress: string
  distance: TextValue
  duration: TextValue
  durationInTraffic: TextValue | null
}

export type RouteResult = {
  available: boolean
  provider: 'google-directions'
  mode: TravelMode
  reason?: string
  summary?: string
  distance?: TextValue
  duration?: TextValue
  durationInTraffic?: TextValue | null
  trafficAware?: boolean
  legs?: Leg[]
  overviewPolyline?: string
  mapsUrl?: string
}

const MODES: TravelMode[] = ['driving', 'walking', 'bicycling', 'transit']
const ROUTE_CACHE_TTL_MS = 60 * 1000

function hasCoordinates(stop: { lat?: number; lng?: number }): boolean {
  return (
    typeof stop.lat === 'number' &&
    typeof stop.lng === 'number' &&
    Number.isFinite(stop.lat) &&
    Number.isFinite(stop.lng)
  )
}

function normalizeStop(stop: RouteStopInput, index: number): NormalizedStop {
  if (typeof stop === 'string') {
    const value = stop.trim()
    return { label: value || `Stop ${index + 1}`, value }
  }
  const coordinates = hasCoordinates(stop) ? `${stop.lat},${stop.lng}` : ''
  const value = coordinates || String(stop.query || stop.address || stop.name || '').trim()
  return { label: String(stop.name || stop.query || stop.address || `Stop ${index + 1}`), value }
}

function textValue(value?: { text?: string; value?: number }): TextValue {
  return { text: String(value?.text || ''), value: Number(value?.value || 0) }
}

function secondsToText(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`
}

function distanceToText(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.max(1, Math.round(meters))} m`
}

function buildMapsUrl(stops: NormalizedStop[], mode: TravelMode): string {
  const params = new URLSearchParams()
  params.set('api', '1')
  params.set('origin', stops[0].value)
  params.set('destination', stops[stops.length - 1].value)
  const waypoints = stops.slice(1, -1).map((stop) => stop.value)
  if (waypoints.length) params.set('waypoints', waypoints.join('|'))
  params.set('travelmode', mode)
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export async function getRouteEta(
  stops: RouteStopInput[],
  mode: TravelMode = 'driving',
): Promise<RouteResult> {
  const normalized = stops.map(normalizeStop)
  if (normalized.length < 2) {
    throw Object.assign(new Error('At least two stops are required'), { status: 400 })
  }
  if (normalized.some((stop) => !stop.value)) {
    throw Object.assign(new Error('All stops must have a name or coordinates'), { status: 400 })
  }

  const safeMode: TravelMode = MODES.includes(mode) ? mode : 'driving'
  if (!env.GOOGLE_MAPS_API_KEY) {
    return {
      available: false,
      provider: 'google-directions',
      mode: safeMode,
      reason: 'Google Maps API key not configured',
    }
  }

  const waypoints = normalized.slice(1, -1).map((stop) => stop.value)
  const cacheKey = `route:${safeMode}:${normalized
    .map((stop) => stop.value)
    .join('|')}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached as RouteResult

  if (safeMode === 'transit' && waypoints.length > 0) {
    return {
      available: false,
      provider: 'google-directions',
      mode: safeMode,
      reason: 'Transit routing supports an origin and destination only',
    }
  }
  const { data } = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
    params: {
      origin: normalized[0].value,
      destination: normalized[normalized.length - 1].value,
      waypoints: waypoints.length ? waypoints.join('|') : undefined,
      mode: safeMode,
      departure_time: safeMode === 'driving' ? 'now' : undefined,
      traffic_model: safeMode === 'driving' ? 'best_guess' : undefined,
      units: 'metric',
      key: env.GOOGLE_MAPS_API_KEY,
    },
    timeout: 8000,
  })

  if (data?.status !== 'OK') {
    const status = String(data?.status || 'UNKNOWN_ERROR')
    throw Object.assign(new Error(`Google Directions API ${status}`), { status: 502 })
  }

  const route = data?.routes?.[0]
  if (!route) throw Object.assign(new Error('No route found for these stops'), { status: 404 })

  const legs: Leg[] = (route.legs || []).map((leg: any, index: number) => ({
    from: normalized[index]?.label || '',
    to: normalized[index + 1]?.label || '',
    startAddress: String(leg.start_address || ''),
    endAddress: String(leg.end_address || ''),
    distance: textValue(leg.distance),
    duration: textValue(leg.duration),
    durationInTraffic: leg.duration_in_traffic ? textValue(leg.duration_in_traffic) : null,
  }))

  const totalDistance = legs.reduce((sum, leg) => sum + leg.distance.value, 0)
  const totalDuration = legs.reduce((sum, leg) => sum + leg.duration.value, 0)
  const trafficValues = legs
    .map((leg) => leg.durationInTraffic?.value)
    .filter((value): value is number => typeof value === 'number')
  const totalTraffic =
    legs.length > 0 && trafficValues.length === legs.length
      ? trafficValues.reduce((sum, value) => sum + value, 0)
      : null
  const trafficAware = totalTraffic !== null

  const result: RouteResult = {
    available: true,
    provider: 'google-directions',
    mode: safeMode,
    summary: String(route.summary || ''),
    distance: { text: distanceToText(totalDistance), value: totalDistance },
    duration: { text: secondsToText(totalDuration), value: totalDuration },
    durationInTraffic: trafficAware
      ? { text: secondsToText(totalTraffic as number), value: totalTraffic as number }
      : null,
    trafficAware,
    legs,
    overviewPolyline: String(route.overview_polyline?.points || ''),
    mapsUrl: buildMapsUrl(normalized, safeMode),
  }
  cacheSet(cacheKey, result, ROUTE_CACHE_TTL_MS)
  return result
}
