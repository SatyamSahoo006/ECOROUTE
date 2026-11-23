import { Router } from 'express'
import { geocode } from '../controllers/geocode.controller'
import { geoLimiter } from '../middleware/rateLimit'

const router = Router()
router.get('/geocode', geoLimiter, geocode)

export default router
