import { Router } from 'express'
import { routeEta } from '../controllers/traffic.controller'
import { authGuard } from '../middleware/auth'
import { routeLimiter } from '../middleware/rateLimit'

const router = Router()
router.post('/route', authGuard, routeLimiter, routeEta)

export default router
