import { Router } from 'express'
import * as ctrl from '../controllers/itinerary.controller'
import { authGuard } from '../middleware/auth'
import { aiLimiter } from '../middleware/rateLimit'

const router = Router()
router.post('/generate', authGuard, aiLimiter, ctrl.generate)
router.post('/save', authGuard, ctrl.save)
router.get('/user', authGuard, ctrl.getUserItineraries)
router.get('/live-status', authGuard, ctrl.liveStatus)

export default router
