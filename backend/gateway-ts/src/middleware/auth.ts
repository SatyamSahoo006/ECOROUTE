import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AuthRequest extends Request {
  user?: { id: string; email: string }
}

export function authGuard(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const match = header?.match(/^Bearer\s+(.+)$/i)
  if (!match) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const decoded = jwt.verify(match[1], env.JWT_SECRET, { algorithms: ['HS256'] }) as any
    if (!decoded || typeof decoded.id !== 'string' || typeof decoded.email !== 'string') {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
