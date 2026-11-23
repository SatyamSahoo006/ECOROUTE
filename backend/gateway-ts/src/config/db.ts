import mongoose from 'mongoose'
import { env } from './env'

let memoryStore = false

export function isMemoryStore() {
  return memoryStore
}

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    })
    memoryStore = false
    console.log('[gateway] MongoDB connected')
  } catch {
    memoryStore = true
    console.warn('[gateway] MongoDB unavailable — using in-memory store fallback. Data will reset on restart.')
  }
}
