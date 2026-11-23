import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import LanguageSelector from './LanguageSelector.jsx'
import { fetchDestinationImage } from '../services/api'
import { ShieldCheck, Sparkles, ArrowRight, MapPin, CheckCircle2 } from './icons.jsx'

const DESTINATIONS = [
  { name: 'Varanasi', tag: 'Spiritual', x: '12%', y: '20%', color: 'from-amber-400/40 to-orange-500/30' },
  { name: 'Munnar', tag: 'Hills', x: '62%', y: '30%', color: 'from-emerald-400/40 to-teal-500/30' },
  { name: 'Ladakh', tag: 'High Desert', x: '40%', y: '66%', color: 'from-sky-400/40 to-indigo-500/30' },
]

const DEMO_CIRCUITS = ['Varanasi', 'Munnar', 'Jaipur', 'Tawang', 'Goa']

export default function PublicHero({ demo = false, onQuickPick }) {
  const { t } = useLang()
  const { openAuth } = useAuth()
  const [bg, setBg] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchDestinationImage('Jaipur, Rajasthan')
      .then((url) => !cancelled && setBg(url))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="platform" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-0">
        {bg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bg})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6">
        <div className="mb-6 flex justify-end lg:hidden">
          <LanguageSelector compact />
        </div>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <div>
            <div className="mb-4 hidden lg:block">
              <LanguageSelector />
            </div>
            <span className="pill border border-emerald-200 bg-emerald-50 text-emerald-700">
              <ShieldCheck size={13} /> {t('engineOnline')} · {t('accuracy')}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl">
              {t('heroA')}{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                {t('heroB')}
              </span>{' '}
              {t('heroC')}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">{t('heroSub')}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button onClick={() => openAuth('signup')} className="btn-primary">
                {t('ctaLaunch')} <ArrowRight size={16} />
              </button>
              <a
                href="#features"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {t('ctaHow')}
              </a>
              {demo && onQuickPick && (
                <div className="mt-5 flex w-full flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">{t('demoTry')}</span>
                  {DEMO_CIRCUITS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onQuickPick(c)}
                      className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 active:scale-95"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" /> {t('featVerified')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" /> {t('featAnti')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" /> {t('featCommunity')}
              </span>
            </div>
          </div>

          {/* Right: gradient mesh media card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-3 shadow-xl backdrop-blur-xl"
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-50 to-sky-100">
              <motion.div
                className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-emerald-300/40 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
                transition={{ duration: 12, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-sky-300/40 blur-3xl"
                animate={{ x: [0, -25, 0], y: [0, -20, 0] }}
                transition={{ duration: 14, repeat: Infinity }}
              />
              {DESTINATIONS.map((d, i) => (
                <motion.div
                  key={d.name}
                  className={`absolute flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 shadow-lg backdrop-blur`}
                  style={{ left: d.x, top: d.y }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                >
                  <span className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${d.color}`}>
                    <MapPin size={16} className="text-slate-700" />
                  </span>
                  <div className="leading-tight">
                    <div className="text-sm font-bold text-slate-800">{d.name}</div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">{d.tag}</div>
                  </div>
                </motion.div>
              ))}
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow">
                 <Sparkles size={13} /> {t('liveVerify')}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
