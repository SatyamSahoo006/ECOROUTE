import { useLang } from '../i18n.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import LanguageSelector from './LanguageSelector.jsx'
import { Leaf, Wifi, WifiOff, ShieldCheck, Sparkles, LogIn, UserPlus } from './icons.jsx'

const NAV = [
  { id: 'platform', label: 'navPlatform' },
  { id: 'features', label: 'navFeatures' },
  { id: 'impact', label: 'navImpact' },
  { id: 'gems', label: 'navGems' },
]

export default function Navbar() {
  const { t } = useLang()
  const { isLoggedIn, user, openAuth, logout, offline, toggleOffline } = useAuth()
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

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.filter((n) => !(n.publicOnly && isLoggedIn)).map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            >
              {t(n.label)}
            </button>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <LanguageSelector />
          {isLoggedIn && (
            <button
              onClick={toggleOffline}
              className={`pill border transition ${
                offline ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle offline / low-connectivity mode"
            >
              {offline ? <WifiOff size={14} /> : <Wifi size={14} />}
              <span className="hidden sm:inline">{offline ? t('lblOffline') : t('lblLive')}</span>
            </button>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {(user?.name || 'U')[0].toUpperCase()}
              </div>
              <button onClick={logout} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                {t('navLogout')}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuth('login')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                 <LogIn size={15} /> {t('loginBtn')}
              </button>
              <button onClick={() => openAuth('signup')} className="btn-primary">
                <UserPlus size={15} /> {t('getStarted')}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
