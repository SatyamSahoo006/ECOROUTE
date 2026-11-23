import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import { connectDB, isMemoryStore } from './config/db'
import authRoutes from './routes/auth.routes'
import itineraryRoutes from './routes/itinerary.routes'
import mediaRoutes from './routes/media.routes'
import geocodeRoutes from './routes/geocode.routes'
import trafficRoutes from './routes/traffic.routes'
import { errorHandler } from './middleware/errorHandler'

const app = express()

app.set('trust proxy', 1)

const ALLOWED_ORIGINS = Array.from(
  new Set([env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean)),
)
const DEV_ORIGIN =
  /^http:\/\/(?:localhost|127\.0\.0\.1|\[::1\]|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):517[34]$/

app.use(
  cors({
    origin: (origin, cb) => {
      const devAllowed = env.NODE_ENV !== 'production' && DEV_ORIGIN.test(origin || '')
      if (!origin || ALLOWED_ORIGINS.includes(origin) || devAllowed) cb(null, true)
      else cb(null, false)
    },
    credentials: true,
  }),
)
app.use(express.json())

app.get('/health', (_req, res) =>
  res.json({ ok: true, service: 'gateway-ts', storage: isMemoryStore() ? 'memory' : 'mongo' }),
)
app.use('/api/auth', authRoutes)
app.use('/api/itinerary', itineraryRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/routes', trafficRoutes)
app.use('/api', geocodeRoutes)
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))
app.use(errorHandler)

export default app

async function bootstrap() {
  await connectDB()
  app.listen(env.PORT, () => console.log(`[gateway] listening on ${env.PORT}`))
}

void bootstrap()
