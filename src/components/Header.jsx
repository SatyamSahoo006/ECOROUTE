import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang, LANGS } from '../i18n.jsx'
import { Leaf, Globe, ChevronDown, Wifi, WifiOff, ShieldCheck, Sparkles } from './icons.jsx'

function LanguageSelector() {
  const { lang, setLang, t } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const current = LANGS.find((l) => l.code === lang)
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <Globe size={16} className="text-emerald-600" />
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md"
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-emerald-50 ${
                  l.code === lang ? 'font-semibold text-emerald-700' : 'text-slate-600'
                }`}
              >
                <span>{l.flag}</span>
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const NAV = [
  { id: 'platform', label: 'Platform' },
  { id: 'impact', label: 'Impact' },
  { id: 'network', label: 'Network' },
  { id: 'map', label: 'Local Gems' },
]

export default function Header({ offline, onToggleOffline, onAccess }) {
  const { t } = useLang()
  const go = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50">
            <Leaf size={22} className="text-emerald-600" />
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500">
              <ShieldCheck size={12} className="text-white" />
            </span>
          </div>
          <div>
            <h1 className="flex items-center gap-1.5 text-lg font-extrabold tracking-tight text-slate-900">
              {t('brand')}
              <Sparkles size={14} className="text-emerald-500" />
            </h1>
            <p className="text-[11px] font-medium uppercase tracking-widest text-emerald-600/80">
              {t('tagline')}
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <span className="pill border border-emerald-200 bg-emerald-50 text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {t('engineOnline')}
          </span>

          <button
            onClick={onToggleOffline}
            className={`pill border transition ${
              offline
                ? 'border-amber-300 bg-amber-50 text-amber-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            title={t('offlineMode')}
          >
            {offline ? <WifiOff size={14} /> : <Wifi size={14} />}
            <span className="hidden sm:inline">{offline ? t('offlineOn') : t('offlineOff')}</span>
          </button>

          <LanguageSelector />

          <button onClick={onAccess} className="btn-primary">
            <Sparkles size={14} /> Access Dashboard
          </button>
        </div>
      </div>
    </header>
  )
}
