import { Router } from 'express'
import { getImage } from '../controllers/media.controller'
import { mediaLimiter } from '../middleware/rateLimit'

const router = Router()
router.get('/image', mediaLimiter, getImage)

export default router
