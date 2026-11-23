import { Response, NextFunction, Request } from 'express'
import axios from 'axios'
import { env } from '../config/env'
import { cacheGet, cacheSet, cityKey } from '../cache'

const USER_AGENT = `EcoRouteAI/1.0 (contact: ${env.CLIENT_URL})`

export async function geocode(req: Request, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string) || ''
    if (!q || q.length > 200) return res.status(400).json({ error: 'missing or invalid q' })
    const key = cityKey('map_coords', q)
    const cached = cacheGet(key)
    if (cached) return res.json(cached)
    const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { format: 'json', limit: 1, q },
      headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      timeout: 8000,
    })
    const hit = data?.[0]
    const lat = Number.parseFloat(hit?.lat)
    const lng = Number.parseFloat(hit?.lon)
    const result = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : { lat: null, lng: null }
    cacheSet(key, result, 10 * 60 * 1000)
    res.json(result)
  } catch (e) {
    next(e)
  }
}
