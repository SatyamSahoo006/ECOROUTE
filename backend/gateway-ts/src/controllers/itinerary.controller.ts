import { AuthRequest } from '../middleware/auth'
import { Response, NextFunction } from 'express'
import { callPythonGenerate, callPythonLiveStatus } from '../services/python.service'
import { ItineraryRepo } from '../models/repo'
import axios from 'axios'
import { env } from '../config/env'

function safeHost(url?: string): string {
  if (!url) return 'Unverified'
  try {
    return new URL(url).hostname
  } catch {
    return 'Unverified'
  }
}

function formatClock(hour: number): string {
  const normalized = ((hour % 24) + 24) % 24
  const h = Math.floor(normalized)
  const m = Math.round((normalized - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function activityTime(index: number): string {
  const start = 9 + index * 2
  return `${formatClock(start)} – ${formatClock(start + 1.5)}`
}

function normalizeItinerary(raw: any) {
  const days = (raw?.days ?? []).map((d: any, di: number) => ({
    day: d.day ?? di + 1,
    title: d.title ?? `Day ${di + 1}`,
    theme: d.theme ?? '',
    activities: (d.activities ?? []).map((a: any, ai: number) => {
      const local = a.local && typeof a.local === 'object' ? a.local : {}
      const rawConfidence = Number(a.confidence)
      const confidence = Number.isFinite(rawConfidence)
        ? Math.round(rawConfidence > 0 && rawConfidence <= 1 ? rawConfidence * 100 : Math.min(100, Math.max(0, rawConfidence)))
        : 0
      const carbonKg = Number(a.carbonKg)
      const status = 'unverified'

      return {
        id: `a-${di}-${ai}`,
        name: a.title ?? 'Unknown',
        time: activityTime(ai),
        interest: a.category ?? '',
        lat: Number.isFinite(Number(a.lat)) ? Number(a.lat) : 0,
        lng: Number.isFinite(Number(a.lng)) ? Number(a.lng) : 0,
        status,
        source: safeHost(a.sourceUrl),
        sourceUrl: a.sourceUrl ?? null,
        confidence,
        checkedMinsAgo: null,
        capacity: null,
        crowdPeak: null,
        crowdBest: null,
        description:
          a.description ||
          a.shortSummary ||
          'Information unavailable, please verify locally',
        sensitive: Array.isArray(a.sensitive) ? a.sensitive : [],
        local: {
          gem: local.gem ?? false,
          vendor: local.vendor ?? null,
          contribution: Number(local.contribution) || 0,
        },
        carbonKg: Number.isFinite(carbonKg) ? Math.max(0, carbonKg) : 0,
        accessibility: Array.isArray(a.accessibility) ? a.accessibility : [],
        alternatives: (Array.isArray(a.alternatives) ? a.alternatives : []).map((al: any) => ({
          name: al.name ?? '',
          distance: al.distance ?? '',
          travel: al.travel ?? '',
          interest: al.interest ?? '',
        })),
        fallback: raw?.fallback === true || a.fallback === true,
      }
    }),
  }))

  return { destination: raw?.destination ?? '', days }
}

async function fetchMedia(destination: string) {
  if (!env.UNSPLASH_ACCESS_KEY) return {}
  const query = destination.split(',')[0].trim()
  if (!query) return {}
  try {
    const { data } = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: 1 },
      headers: { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` },
      timeout: 3000,
    })
    const photo = data?.results?.[0]
    return photo ? { imageUrl: photo.urls.regular, credit: photo.user?.name } : {}
  } catch {
    return {}
  }
}

export async function generate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = (req.body || {}) as Record<string, any>
    if (typeof body.destination !== 'string' || !body.destination.trim()) {
      return res.status(400).json({ error: 'destination is required' })
    }
    const destination = body.destination.trim()
    const payload = {
      destination,
      dates: typeof body.dates === 'string' ? body.dates : undefined,
      budget: typeof body.budget === 'string' ? body.budget : undefined,
      pacing: typeof body.pacing === 'string' ? body.pacing : undefined,
      interests: Array.isArray(body.interests) ? body.interests.filter((x: any) => typeof x === 'string') : [],
      accessibilityNeeds: Array.isArray(body.accessibility) ? body.accessibility.filter((x: any) => typeof x === 'string') : [],
      localOnly: !!body.localOnly,
      requests: typeof body.requests === 'string' ? body.requests : '',
      user: req.user,
    }
    const [ai, media] = await Promise.all([callPythonGenerate(payload), fetchMedia(destination)])

    res.json({ itinerary: normalizeItinerary(ai), media })
  } catch (e) {
    next(e)
  }
}

export async function save(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { destination, payload, result } = (req.body || {}) as Record<string, any>
    if (typeof destination !== 'string' || !destination.trim()) {
      return res.status(400).json({ error: 'destination is required' })
    }
    if (!result || typeof result !== 'object') {
      return res.status(400).json({ error: 'result is required' })
    }
    const doc = await ItineraryRepo.create({
      userId: req.user!.id,
      destination: destination.trim(),
      payload: payload && typeof payload === 'object' ? payload : {},
      result,
    })
    res.status(201).json({ id: doc._id })
  } catch (e) {
    next(e)
  }
}

export async function getUserItineraries(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const list = await ItineraryRepo.findByUser(req.user!.id)
    res.json(list)
  } catch (e) {
    next(e)
  }
}

export async function liveStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const destination = String(req.query.destination || '')
    if (!destination) return res.status(400).json({ error: 'destination required' })
    const data = await callPythonLiveStatus(destination)
    res.json(data)
  } catch (e) {
    next(e)
  }
}
