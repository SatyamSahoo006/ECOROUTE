// Frontend service layer for the EcoRoute AI backend.
// Talks to the itinerary generation endpoint and provides an offline-safe
// fallback so the UI keeps working when no backend is reachable.

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
const ENDPOINT = `${API_BASE}/api/itinerary/generate`

export async function verifyEmailToken(token) {
  const res = await fetch(`${API_BASE}/api/auth/verify-email?token=${encodeURIComponent(token)}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Verification failed')
  return data
}

export async function saveItinerary(destination, payload, result) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('ecoroute_token') : null
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}/api/itinerary/save`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ destination, payload, result }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Save failed (${res.status})`)
  return data
}

export async function getUserItineraries() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('ecoroute_token') : null
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}/api/itinerary/user`, { headers })
  const data = await res.json().catch(() => ([]))
  if (!res.ok) throw new Error(data.error || `Fetch failed (${res.status})`)
  return data
}

export async function fetchRouteEta(stops, mode = 'driving') {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('ecoroute_token') : null
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    try {
      const res = await fetch(`${API_BASE}/api/routes/route`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ stops, mode }),
        signal: controller.signal,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return null
      return data
    } finally {
      clearTimeout(timeout)
    }
  } catch {
    return null
  }
}

export async function generateItinerary(payload) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('ecoroute_token') : null
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25000)
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`Backend responded ${res.status}`)
    const data = await res.json()
    // Accept either { itinerary } or a bare itinerary object.
    return data?.itinerary || data
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Request timed out. Please try again.')
    throw e
  } finally {
    clearTimeout(timeout)
  }
}

// ---- Offline / no-backend fallback generator ----
const INTEREST_META = {
  heritage: { label: 'Heritage', names: ['Heritage Walk', 'Old Fort', 'Temple Complex', 'Museum & Crafts'] },
  nature: { label: 'Nature', names: ['Lake & Wetlands', 'Hill Viewpoint', 'Botanical Garden', 'Forest Trail'] },
  adventure: { label: 'Adventure', names: ['Trek Start', 'River Rafting', 'Zip-line', 'Cliff Drive'] },
  food: { label: 'Food', names: ['Local Kitchen', 'Street Food Tour', 'Family Dhaba', 'Market Tasting'] },
  shopping: { label: 'Shopping', names: ['Artisan Market', 'Silk Emporium', 'Bazaar Stroll', 'Co-op Store'] },
  religious: { label: 'Religious', names: ['Temple Visit', 'Pilgrim Route', 'Ghat & Aarti', 'Shrine Walk'] },
  beach: { label: 'Beach', names: ['Beach Morning', 'Coastal Walk', 'Sunset Shore', 'Boat Point'] },
  wildlife: { label: 'Wildlife', names: ['Safari Drive', 'Bird Sanctuary', 'National Park', 'Estuary Boat'] },
}

const DAY_TITLES = ['Arrival & Orientation', 'Deep Dive', 'Hidden Gems', 'Final Explorations']

export function buildLocalItinerary(form) {
  const dest = form.destination || 'Your Destination'
  const city = dest.split(',')[0].trim()
  const interests = form.interests?.length ? form.interests : ['heritage', 'nature']
  const dayCount = form.pacing === 'packed' ? 4 : form.pacing === 'relaxed' ? 2 : 3
  const perDay = form.pacing === 'packed' ? 3 : 2
  const days = []
  let idc = 0

  for (let d = 1; d <= dayCount; d++) {
    const activities = []
    for (let k = 0; k < perDay; k++) {
      const key = interests[(d * 2 + k) % interests.length]
      const meta = INTEREST_META[key] || INTEREST_META.heritage
      activities.push({
        id: `g${idc++}`,
        name: `${meta.names[(d + k) % meta.names.length]} (${city})`,
        time: `${8 + k * 3}:00 – ${9 + k * 3}:30`,
        interest: key,
        status: 'unverified',
        source: 'Unverified',
        sourceUrl: '',
        confidence: 0,
        checkedMinsAgo: null,
        capacity: null,
        sensitive: [],
        description: `Generated locally as a demo fallback. Verify timings, access, and safety in ${dest} before travel.`,
        local: { gem: false, vendor: null, contribution: 0 },
        carbonKg: 0,
        crowdPeak: null,
        crowdBest: null,
        alternatives: [],
        fallback: true,
      })
    }
    days.push({
      day: d,
      title: DAY_TITLES[d - 1] || `Day ${d}`,
      theme: interests[0],
      activities,
    })
  }

  return { destination: dest, days, _generated: true, _provenance: 'offline-demo' }
}

// ---- Media & live data fetchers (with graceful fallbacks) ----
const MEDIA_URL = `${API_BASE}/api/media/image`
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80'

async function getJSON(url, ms = 7000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error('bad')
    return await res.json()
  } finally {
    clearTimeout(id)
  }
}

// High-res landscape image for a destination, with a guaranteed India fallback.
export async function fetchDestinationImage(destination) {
  const q = encodeURIComponent(destination || 'India travel')
  try {
    const data = await getJSON(`${MEDIA_URL}?query=${q}`)
    return data?.imageUrl || DEFAULT_IMAGE
  } catch {
    return DEFAULT_IMAGE
  }
}

// Live weather + capacity via gateway (auth-protected proxy to AI engine).
export async function fetchLiveConditions(destination) {
  const city = String(destination || '').split(',')[0].trim()
  if (!city) return null
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('ecoroute_token') : null
  if (!token) return null
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(`${API_BASE}/api/itinerary/live-status?destination=${encodeURIComponent(city)}`, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${token}` },
    })
    clearTimeout(id)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
