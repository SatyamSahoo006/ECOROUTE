import { env } from '../config/env'

export async function sendVerificationEmail(to: string, token: string) {
  const nodemailer = await import('nodemailer').catch(() => null)
  if (!nodemailer) {
    console.warn('[email] nodemailer not installed — skipping verification email')
    return
  }
  const transporter = nodemailer.default.createTransport({
    service: env.EMAIL_SERVICE,
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
  })
  const url = `${env.CLIENT_URL}/verify-email?token=${token}`
  await transporter.sendMail({
    from: env.EMAIL_USER,
    to,
    subject: 'Verify your EcoRoute AI account',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#064e3b">Welcome to EcoRoute AI</h2>
        <p>Thanks for joining. Confirm your email to unlock verified, hallucination-free itineraries.</p>
        <p><a href="${url}" style="background:#10b981;color:#04231a;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:700">Verify Email</a></p>
        <p style="color:#64748b;font-size:12px">Or paste this link: ${url}</p>
      </div>`,
  })
}
