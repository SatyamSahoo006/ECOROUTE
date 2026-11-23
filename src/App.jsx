import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import PublicLandingPage from './components/PublicLandingPage.jsx'
import AppDashboard from './components/AppDashboard.jsx'
import DoorIntro from './components/DoorIntro.jsx'
import AuroraBackground from './components/AuroraBackground.jsx'
import AuthModal from './components/AuthModal.jsx'
import { generateItinerary, buildLocalItinerary, verifyEmailToken } from './services/api.js'
import { useLang } from './i18n.jsx'
import { useToast } from './components/Toast.jsx'
import { Loader2 } from './components/icons.jsx'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
const GENERATE_STEPS = [
  'Connecting to itinerary engine...',
  'Checking available source and weather signals...',
  'Preparing route context and local-impact details...',
]

const INITIAL_FORM = {
  destination: 'Bhubaneswar, Odisha',
  dates: '2026-08-28',
  travelers: { adults: 2, children: 1, seniors: 1 },
  budget: 'mid',
  pacing: 'balanced',
  interests: ['heritage', 'nature', 'food'],
  accessibility: ['wheelchair'],
  requests: '',
  localOnly: false,
}

function AppInner() {
  const { isLoggedIn, openAuth } = useAuth()
  const { t } = useLang()
  const { toast } = useToast()
  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [itinerary, setItinerary] = useState(null)
  const [showIntro, setShowIntro] = useState(true)
  const [progress, setProgress] = useState('')
  const [pendingDemoCity, setPendingDemoCity] = useState(null)
  const [verifyState, setVerifyState] = useState({ status: 'idle', message: '' })

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isLoggedIn) setShowIntro(false)
  }, [isLoggedIn])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('verifyToken') || (window.location.pathname === '/verify-email' ? params.get('token') : null)
    if (!token) return
    setVerifyState({ status: 'loading', message: 'Verifying your email...' })
    verifyEmailToken(token)
      .then((data) => {
        setVerifyState({ status: 'success', message: data?.message || 'Email verified. You can now log in.' })
        toast(data?.message || 'Email verified', 'success')
        openAuth('login')
      })
      .catch((e) => {
        setVerifyState({ status: 'error', message: e.message || 'Verification failed' })
        toast(e.message || 'Verification failed', 'error')
      })
      .finally(() => {
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        url.searchParams.delete('verifyToken')
        if (url.pathname === '/verify-email') url.pathname = '/'
        window.history.replaceState({}, '', url.pathname + url.search + url.hash)
      })
  }, [openAuth, toast])

  const handleGenerate = async (override) => {
    const f = override || form
    if (!f.destination?.trim()) {
      toast(t('destinationPlaceholder'), 'error')
      return
    }
    setLoading(true)
    setGenerated(false)
    setProgress(GENERATE_STEPS[0])
    const timer = setInterval(() => {
      setProgress((p) => {
        const i = GENERATE_STEPS.indexOf(p)
        return GENERATE_STEPS[Math.min(i + 1, GENERATE_STEPS.length - 1)]
      })
    }, 1100)
    const payload = {
      destination: f.destination,
      dates: f.dates,
      travelers: f.travelers,
      budget: f.budget,
      pacing: f.pacing,
      interests: f.interests,
      accessibility: f.accessibility,
      localOnly: f.localOnly,
      requests: f.requests,
    }
    try {
      const itin = await generateItinerary(payload)
      setItinerary(itin)
      setGenerated(true)
      toast(t('genSuccess'), 'success')
      setTimeout(() => scrollTo('results'), 60)
    } catch (e) {
      setItinerary(buildLocalItinerary(f))
      setGenerated(true)
      toast(t('genOffline'), 'info')
      setTimeout(() => scrollTo('results'), 60)
    } finally {
      clearInterval(timer)
      setProgress('')
      setLoading(false)
    }
  }

  const handleQuickPick = (city) => {
    setForm((f) => ({ ...f, destination: city }))
    if (!isLoggedIn) {
      setPendingDemoCity(city)
      openAuth('signup')
    } else {
      handleGenerate({ ...form, destination: city })
    }
  }

  useEffect(() => {
    if (isLoggedIn && pendingDemoCity) {
      const city = pendingDemoCity
      setPendingDemoCity(null)
      handleGenerate({ ...form, destination: city })
    }
  }, [isLoggedIn, pendingDemoCity])

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <DoorIntro
        open={showIntro}
        onExplore={() => setShowIntro(false)}
        onAccess={() => {
          setShowIntro(false)
          if (!isLoggedIn) openAuth('login')
          else scrollTo('builder')
        }}
      />
      <Navbar />

      <AnimatePresence mode="wait">
        {isLoggedIn ? (
          <motion.div
            key="dash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AppDashboard
              form={form}
              setForm={setForm}
              onGenerate={handleGenerate}
              onQuickPick={handleQuickPick}
              demo={DEMO_MODE}
              loading={loading}
              generated={generated}
              itinerary={itinerary}
            />
          </motion.div>
        ) : (
          <motion.div
            key="land"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PublicLandingPage demo={DEMO_MODE} onQuickPick={handleQuickPick} />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-8 border-t border-slate-200 pb-8 pt-6 text-center text-[11px] text-slate-400">
        {t('footer')}
      </footer>

      <AuthModal />
      <AnimatePresence>
        {verifyState.status !== 'idle' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-white/70 backdrop-blur-sm p-4"
            onClick={() => setVerifyState({ status: 'idle', message: '' })}
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-w-md w-full text-center" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm font-semibold text-slate-800">
                {verifyState.status === 'loading' ? 'Verifying email...' : verifyState.message}
              </p>
              {verifyState.status !== 'loading' && (
                <button className="btn-primary mt-4" onClick={() => setVerifyState({ status: 'idle', message: '' })}>{t('gotIt')}</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loading && (
          <motion.div
            key="gen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-white/70 backdrop-blur-sm"
          >
            <div className="w-full max-w-md px-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
                <Loader2 className="mx-auto mb-5 animate-spin text-emerald-500" size={34} />
                <div className="space-y-3 text-left">
                  {GENERATE_STEPS.map((s, i) => {
                    const idx = GENERATE_STEPS.indexOf(progress)
                    const done = idx > i
                    const active = progress === s
                    return (
                      <div
                        key={s}
                        className={`flex items-center gap-3 text-sm ${
                          active ? 'font-semibold text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${
                            done
                              ? 'bg-emerald-500 text-white'
                              : active
                                ? 'border border-emerald-400 text-emerald-600'
                                : 'border border-slate-200 text-slate-300'
                          }`}
                        >
                          {done ? '✓' : i + 1}
                        </span>
                        {s}
                      </div>
                    )
                  })}
                </div>
                <p className="mt-5 text-xs text-slate-400">{t('generating')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
