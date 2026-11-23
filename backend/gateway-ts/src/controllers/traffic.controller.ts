import { Request, Response, NextFunction } from 'express'
import { getRouteEta, RouteStopInput, TravelMode } from '../services/maps.service'

const MODES = ['driving', 'walking', 'bicycling', 'transit']

export async function routeEta(req: Request, res: Response, next: NextFunction) {
  try {
    const body = (req.body || {}) as Record<string, any>
    const rawStops = Array.isArray(body.stops) ? body.stops : []
    const stops: RouteStopInput[] = rawStops
      .filter((stop: any) =>
        typeof stop === 'string' ? !!stop.trim() : !!stop && typeof stop === 'object',
      )
      .slice(0, 25)

    if (stops.length < 2) {
      return res.status(400).json({ error: 'stops must contain at least two locations' })
    }

    const requestedMode = String(body.mode || 'driving') as TravelMode
    const mode: TravelMode = MODES.includes(requestedMode) ? requestedMode : 'driving'
    const result = await getRouteEta(stops, mode)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}
