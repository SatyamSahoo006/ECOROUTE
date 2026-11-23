import { env } from '../config/env'

export async function handleGoogleIdToken(idToken: string): Promise<{ email: string; name: string; googleId: string }> {
  if (!idToken) throw Object.assign(new Error('idToken required'), { status: 400 })

  if (!env.GOOGLE_CLIENT_ID) {
    throw Object.assign(new Error('Google sign-in is not configured'), { status: 503 })
  }

  const { OAuth2Client } = await import('google-auth-library').catch(() => ({ OAuth2Client: null as any }))
  if (!OAuth2Client) {
    throw Object.assign(new Error('Google sign-in is unavailable'), { status: 503 })
  }

  try {
    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID })
    const payload = ticket.getPayload()
    if (!payload?.email || !payload.email_verified) {
      throw new Error('Google account email is not verified')
    }
    return {
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      googleId: payload.sub,
    }
  } catch (error: any) {
    if (error?.status === 503) throw error
    throw Object.assign(new Error('Invalid Google token'), { status: 401 })
  }
}
