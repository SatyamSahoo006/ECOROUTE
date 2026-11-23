import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[gateway] error:', err)
  const status = Number.isInteger(err?.status) && err.status >= 400 && err.status < 600 ? err.status : 500
  const message = status < 500 ? err?.message : 'Internal Server Error'
  res.status(status).json({ error: message || 'Internal Server Error' })
}
