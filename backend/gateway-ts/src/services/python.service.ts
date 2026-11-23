import axios from 'axios'
import { env } from '../config/env'
import { cacheGet, cacheSet, hashKey } from '../cache'

const GENERATE_TIMEOUT_MS = 18000
const LIVE_TIMEOUT_MS = 6000
const GENERATE_CACHE_TTL_MS = 10 * 60 * 1000

export async function callPythonGenerate(payload: Record<string, any>) {
  const key = hashKey('itinerary', payload)
  const cached = cacheGet(key)
  if (cached) return cached
  const { data } = await axios.post(`${env.PYTHON_AI_SERVICE_URL}/py/generate`, payload, {
    timeout: GENERATE_TIMEOUT_MS,
  })
  cacheSet(key, data, GENERATE_CACHE_TTL_MS)
  return data
}

export async function callPythonLiveStatus(destination: string) {
  const { data } = await axios.get(`${env.PYTHON_AI_SERVICE_URL}/py/live-status`, {
    params: { destination },
    timeout: LIVE_TIMEOUT_MS,
  })
  return data
}
