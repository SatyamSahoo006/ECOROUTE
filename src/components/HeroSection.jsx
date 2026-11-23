import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import ItineraryForm from './ItineraryForm.jsx'
import { fetchDestinationImage } from '../services/api'
import { ShieldCheck, Sparkles, Lock } from './icons.jsx'

const DEMO_CIRCUITS = ['Varanasi', 'Munnar', 'Jaipur', 'Tawang', 'Goa']

export default function HeroSection({ form, setForm, onGenerate, onQuickPick, demo = false, loading }) {
  const { t } = useLang()
  const { isLoggedIn, openAuth } = useAuth()
  const [bg, setBg] = useState(null)

  useEffect(() => {
    let cancelled = false
    const id = setTimeout(() => {
      fetchDestinationImage(form.destination)
        .then((url) => !cancelled && setBg(url))
        .catch(() => {})
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [form.destination])

  const handleGenerate = () => {
    if (!isLoggedIn) {
      openAuth('signup')
      return
    }
    onGenerate()
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-0">
        {bg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bg})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/75 to-white/90" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pill border border-emerald-200 bg-emerald-50 text-emerald-700">
            <ShieldCheck size={13} /> {t('engineOnline')} · {t('accuracy')}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            {t('dashTitleA')}{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              {t('dashTitleB')}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            {t('dashSub')}
          </p>
          {!isLoggedIn && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Lock size={13} className="text-emerald-500" /> {t('dashSignIn')}
            </p>
          )}
          {demo && onQuickPick && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
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

        <div id="builder" className="mx-auto mt-10 max-w-3xl scroll-mt-24">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-2 shadow-xl backdrop-blur-xl sm:p-3">
            <ItineraryForm data={form} setData={setForm} onSubmit={handleGenerate} loading={loading} />
          </div>
        </div>
      </div>
    </section>
  )
}
