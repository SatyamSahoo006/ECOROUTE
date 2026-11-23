import type { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { UserRepo } from '../models/repo'
import { sendVerificationEmail } from '../services/email.service'
import { handleGoogleIdToken } from '../services/google.service'
import { generateToken, hashToken } from '../utils/token'

const JWT_EXPIRES = '1d'
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000

function signToken(id: string, email: string) {
  return jwt.sign({ id, email }, env.JWT_SECRET, { expiresIn: JWT_EXPIRES, algorithm: 'HS256' })
}

function emailConfigured() {
  return Boolean(env.EMAIL_USER && env.EMAIL_PASS)
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body || {}
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password.trim()) {
      return res.status(400).json({ error: 'Email and password required' })
    }
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const normalizedEmail = email.toLowerCase().trim()
    const existing = await UserRepo.findByEmail(normalizedEmail)
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const rawToken = generateToken()
    const needsVerification = emailConfigured()
    const user = await UserRepo.create({
      email: normalizedEmail,
      name: typeof name === 'string' && name.trim() ? name.trim() : normalizedEmail.split('@')[0],
      password: hashed,
      emailVerifyToken: needsVerification ? hashToken(rawToken) : undefined,
      emailVerifyTokenExpires: needsVerification ? new Date(Date.now() + VERIFY_TOKEN_TTL_MS) : undefined,
      isEmailVerified: !needsVerification,
    })

    if (needsVerification) {
      await sendVerificationEmail(user.email, rawToken)
    }

    return res.status(201).json({
      message: needsVerification
        ? 'Account created. Verification link sent to your email.'
        : 'Account created. Email delivery is not configured, so this development account is already verified.',
      needsVerification,
    })
  } catch (e) {
    next(e)
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.query as { token?: string }
    if (!token) return res.status(400).json({ error: 'Missing token' })
    const user = await UserRepo.findByVerifyToken(hashToken(token))
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' })
    const expires = user.emailVerifyTokenExpires ? new Date(user.emailVerifyTokenExpires).getTime() : 0
    if (expires && expires < Date.now()) {
      user.emailVerifyToken = undefined
      user.emailVerifyTokenExpires = undefined
      await UserRepo.save(user)
      return res.status(400).json({ error: 'Invalid or expired token' })
    }
    user.isEmailVerified = true
    user.emailVerifyToken = undefined
    user.emailVerifyTokenExpires = undefined
    await UserRepo.save(user)
    return res.json({ message: 'Email verified. You can now log in.' })
  } catch (e) {
    next(e)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body || {}
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }
    const user = await UserRepo.findByEmail(email.toLowerCase().trim())
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Email verification required', needsVerification: true })
    }
    const token = signToken(String(user._id), user.email)
    return res.json({
      token,
      user: { id: String(user._id), email: user.email, name: user.name, isEmailVerified: true },
    })
  } catch (e) {
    next(e)
  }
}

export async function google(req: Request, res: Response, next: NextFunction) {
  try {
    const { idToken } = req.body
    if (!idToken || typeof idToken !== 'string') return res.status(400).json({ error: 'idToken required' })
    const payload = await handleGoogleIdToken(idToken)
    let user = await UserRepo.findByEmail(payload.email)
    if (!user) {
      user = await UserRepo.create({
        email: payload.email,
        name: payload.name,
        password: undefined,
        googleId: payload.googleId,
        emailVerifyToken: undefined,
        emailVerifyTokenExpires: undefined,
        isEmailVerified: true,
      })
    } else {
      user.isEmailVerified = true
      user.googleId = payload.googleId
      user.emailVerifyToken = undefined
      user.emailVerifyTokenExpires = undefined
      await UserRepo.save(user)
    }
    const token = signToken(String(user._id), user.email)
    return res.json({
      token,
      user: { id: String(user._id), email: user.email, name: user.name, isEmailVerified: true },
    })
  } catch (e) {
    next(e)
  }
}
