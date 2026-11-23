import dotenv from 'dotenv'
import path from 'path'

const rootEnvPath = path.resolve(__dirname, '../../../../.env')
dotenv.config({ path: rootEnvPath })

const isProduction = process.env.NODE_ENV === 'production'
const configuredJwtSecret = process.env.JWT_SECRET

if (isProduction && (!configuredJwtSecret || configuredJwtSecret.length < 32)) {
  throw new Error('JWT_SECRET must be set to at least 32 characters in production')
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.GATEWAY_PORT || process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ecoroute',
  JWT_SECRET: configuredJwtSecret || 'dev-insecure-jwt-secret-change-me',
  PYTHON_AI_SERVICE_URL: process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000',
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || '',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
}
