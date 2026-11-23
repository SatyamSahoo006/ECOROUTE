import { Router } from 'express'
import * as ctrl from '../controllers/auth.controller'
import { authLimiter } from '../middleware/rateLimit'

const router = Router()
router.post('/register', authLimiter, ctrl.register)
router.get('/verify-email', authLimiter, ctrl.verifyEmail)
router.post('/login', authLimiter, ctrl.login)
router.post('/google', authLimiter, ctrl.google)

export default router
