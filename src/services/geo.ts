// Lightweight geocoding + point spreading for the interactive map.
// Prefers the gateway's cached /api/geocode endpoint, falls back to a direct
// OpenStreetMap Nominatim call. Results are memoized per session.

const CACHE = new Map()
const GATEWAY = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export async function geocodeDestination(destination) {
  const city = String(destination || '').split(',')[0].trim()
  if (!city) return null
  if (CACHE.has(city)) return CACHE.get(city)
  let result = null
  try {
    const r = await fetch(`${GATEWAY}/api/geocode?q=${encodeURIComponent(city)}`)
    if (r.ok) {
      const d = await r.json()
      result = d && typeof d.lat === 'number' ? { lat: d.lat, lng: d.lng } : null
    }
  } catch {
    result = null
  }
  if (!result) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`,
        { headers: { Accept: 'application/json' } },
      )
      const json = await res.json()
      const hit = json?.[0]
      result = hit ? { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon) } : null
    } catch {
      result = null
    }
  }
  CACHE.set(city, result)
  return result
}

// Deterministically scatter N points around a center so the route looks organic
// without requiring backend coordinates.
export function spreadPoints(center, count) {
  const pts = []
  for (let i = 0; i < count; i++) {
    const ang = i * 2.399963
    const rad = 0.012 + (i % 6) * 0.006
    pts.push({
      lat: center.lat + rad * Math.cos(ang),
      lng: center.lng + rad * Math.sin(ang),
    })
  }
  return pts
}
