import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Mail, Lock, ExternalLink, Send, CheckCircle2, User } from './icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../i18n.jsx'

export default function LoginPage() {
  const { authModalOpen, setAuthModalOpen, login, signup, user } = useAuth()
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login')
  const [sent, setSent] = useState(false)
  const googleDiv = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setAuthModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setAuthModalOpen])

  const close = () => {
    setAuthModalOpen(false)
    setTimeout(() => setError(''), 300)
  }

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSent(false)
    try {
      if (mode === 'signup') {
        const data = await signup(name, email, password)
        if (data?.needsVerification === false) {
          await login(email, password)
          setAuthModalOpen(false)
          return
        }
        setSent(true)
      } else {
        await login(email, password)
        setAuthModalOpen(false)
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          className="fixed inset-0 z-[120] grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {mode === 'login' ? t('welcomeBack') : t('createAccount')}
                </h2>
                <p className="text-xs text-slate-500">{t('authSubtitle')}</p>
              </div>
              <button onClick={close} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <ExternalLink size={18} />
              </button>
            </div>

            {mode === 'signup' && (
              <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <Send size={20} className="mx-auto text-emerald-500" />
                <p className="mt-2 text-sm font-semibold text-slate-800">Check your email to verify your account</p>
                <p className="text-xs text-slate-500">We've sent a verification link to {email}</p>
              </div>
            )}

            <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> {mode === 'login' ? t('orLoginEmail') : t('orSignupEmail')} <span className="h-px flex-1 bg-slate-200" />
            </div>

            {user && user.isEmailVerified ? (
              <div className="mb-4 text-center">
                <CheckCircle2 size={28} className="mx-auto text-emerald-600" />
                <p className="mt-2 text-sm font-semibold text-slate-800">Email verified!</p>
                <p className="text-xs text-slate-500">You can now access the full dashboard.</p>
                <button
                  onClick={() => setAuthModalOpen(false)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  {t('gotIt')}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
            {mode === 'signup' && sent && (

                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('fullName')}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('emailPh')}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('passwordPh')}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-400"
                  />
                </div>

                {error && <p className="text-center text-xs font-medium text-rose-600">{error}</p>}

                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? t('pleaseWait') : mode === 'login' ? t('loginBtn') : t('createBtn')}
                </button>

                <p className="mt-4 text-center text-xs text-slate-500">
                  {mode === 'login' ? t('noAccount') : t('haveAccount')}{' '}
                  <button
                    onClick={() => {
                      setMode(mode === 'login' ? 'signup' : 'login')
                      setError('')
                    }}
                    className="font-semibold text-emerald-600 hover:underline"
                  >
                    {mode === 'login' ? t('signUpLink') : t('loginLink')}
                  </button>
                </p>
              </form>
            )}

            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <div ref={googleDiv} className="mb-4 flex justify-center" />
            ) : (
              <button
                disabled
                className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-400"
              >
                <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.2 0 19-7.4 20.5-17l-3.9-.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 5.1 29.4 3 24 3 16.3 3 9.7 7.2 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35.7 26.7 36.6 24 36.6c-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.6 40.7 16.2 45 24 45z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.3C40.9 36.3 44 30.7 44 24c0-1.2-.1-2.3-.4-3.5z" />
                </svg> {t('continueGoogle')}
              </button>
            )}
            {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <p className="mb-4 text-center text-[11px] text-slate-400">{t('googleUnavailable')}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}