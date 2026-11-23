import { createHash } from 'crypto'

const CACHE_TTL_MS = 30 * 60 * 1000

type Entry = { value: any; expires: number }
const store = new Map<string, Entry>()
const MAX_ENTRIES = 500

function normalizeCity(city: string): string {
  return String(city || '')
    .toLowerCase()
    .split(',')[0]
    .trim()
    .replace(/\s+/g, '-')
}

export function hashKey(prefix: string, value: unknown): string {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value ?? null)
  const digest = createHash('sha256').update(serialized).digest('hex').slice(0, 32)
  return `${prefix}:${digest}`
}

export function cityKey(prefix: string, city: string): string {
  return hashKey(prefix, normalizeCity(city))
}

export function cacheGet(key: string): any | null {
  const e = store.get(key)
  if (!e) return null
  if (e.expires < Date.now()) {
    store.delete(key)
    return null
  }
  return e.value
}

export function cacheSet(key: string, value: any, ttlMs: number = CACHE_TTL_MS): void {
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value
    if (oldest) store.delete(oldest)
  }
  store.set(key, { value, expires: Date.now() + ttlMs })
}

export const CACHE_TTL_SECONDS = 1800
