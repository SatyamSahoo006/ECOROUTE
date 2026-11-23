import { Response, NextFunction, Request } from 'express'
import axios from 'axios'
import { env } from '../config/env'
import { cacheGet, cacheSet, cityKey } from '../cache'

const FALLBACK =
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80'

export async function getImage(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (req.query.query as string) || 'India travel'
    if (!env.UNSPLASH_ACCESS_KEY) return res.json({ imageUrl: FALLBACK })
    const key = cityKey('image', query)
    const cached = cacheGet(key)
    if (cached) return res.json(cached)

    const { data } = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: 1 },
      headers: { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` },
      timeout: 3000,
    })
    const photo = data?.results?.[0]
    if (!photo) return res.json({ imageUrl: FALLBACK })
    const payload = {
      imageUrl: photo.urls.regular,
      credit: photo.user?.name,
      source: photo.links?.html,
    }
    cacheSet(key, payload)
    res.json(payload)
  } catch {
    res.json({ imageUrl: FALLBACK })
  }
}
