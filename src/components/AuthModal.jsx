import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, CheckCircle2, Send } from './icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../i18n.jsx'

function GoogleLogo() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.2 0 19-7.4 20.5-17l-3.9-.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 5.1 29.4 3 24 3 16.3 3 9.7 7.2 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35.7 26.7 36.6 24 36.6c-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.6 40.7 16.2 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.3C40.9 36.3 44 30.7 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  )
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode, login, signup, loginWithGoogle } =
    useAuth()
  const { t } = useLang()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const googleDiv = useRef(null)

  useEffect(() => {
    if (!authModalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setAuthModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [authModalOpen, setAuthModalOpen])

  const close = () => {
    setAuthModalOpen(false)
    setTimeout(() => {
      setSent(false)
      setError('')
    }, 300)
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleDiv.current || !authModalOpen) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      window.google?.accounts?.id?.initialize({
        client_id: GOOGLE_CLIENT_ID,
          callback: async (resp) => {
            try {
              await loginWithGoogle(resp.credential)
              setAuthModalOpen(false)
            } catch (err) {
              setError(err?.message || t('googleFailed'))
            }
          },

      })
      window.google?.accounts?.id?.renderButton(googleDiv.current, {
        theme: 'outline',
        size: 'large',
        width: googleDiv.current.offsetWidth,
      })
    }
    document.body.appendChild(script)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authModalOpen, loginWithGoogle, t])

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (authMode === 'signup') {
        const result = await signup(name, email, password)
        if (result?.needsVerification === false) {
          await login(email, password)
          setAuthModalOpen(false)
        } else {
          setSent(true)
        }
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
                  {authMode === 'login' ? t('welcomeBack') : t('createAccount')}
                </h2>
                <p className="text-xs text-slate-500">{t('authSubtitle')}</p>
              </div>
              <button onClick={close} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            {GOOGLE_CLIENT_ID ? (
              <div ref={googleDiv} className="mb-4 flex justify-center" />
            ) : (
              <div className="mb-4">
                <button
                  disabled
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-400"
                >
                  <GoogleLogo /> {t('continueGoogle')}
                </button>
                <p className="mt-2 text-center text-[11px] text-slate-400">{t('googleUnavailable')}</p>
              </div>
            )}

            <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> {authMode === 'login' ? t('orLoginEmail') : t('orSignupEmail')} <span className="h-px flex-1 bg-slate-200" />
            </div>

            {sent ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <CheckCircle2 size={28} className="mx-auto text-emerald-600" />
                <p className="mt-2 text-sm font-semibold text-slate-800">{t('verifySent')}</p>
                <p className="text-xs text-slate-500">{t('verifyNote')}</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  <Send size={13} /> {t('editDetails')}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                {authMode === 'signup' && (
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
                  {submitting ? t('pleaseWait') : authMode === 'login' ? t('loginBtn') : t('createBtn')}
                </button>
              </form>
            )}

            {!sent && (
              <p className="mt-4 text-center text-xs text-slate-500">
                {authMode === 'login' ? t('noAccount') : t('haveAccount')}{' '}
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'signup' : 'login')
                    setError('')
                  }}
                  className="font-semibold text-emerald-600 hover:underline"
                >
                  {authMode === 'login' ? t('signUpLink') : t('loginLink')}
                </button>
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
