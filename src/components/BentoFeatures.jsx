import { motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import {
  ShieldCheck,
  AlertTriangle,
  HandHeart,
  CheckCircle2,
  HelpCircle,
  UserCheck,
  ArrowRight,
  ExternalLink,
} from './icons.jsx'

const BADGE_META = {
  verified: { label: 'verified', Icon: CheckCircle2, cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  userSubmitted: { label: 'userSubmitted', Icon: UserCheck, cls: 'border-amber-200 bg-amber-50 text-amber-700' },
  unverified: { label: 'unverified', Icon: HelpCircle, cls: 'border-slate-200 bg-slate-50 text-slate-500' },
}

function Badge({ status }) {
  const { t } = useLang()
  const m = BADGE_META[status] || BADGE_META.unverified
  return (
    <span className={`pill border ${m.cls}`}>
      <m.Icon size={13} /> {t(m.label)}
    </span>
  )
}

function ConfidenceBar({ value, status }) {
  const { t } = useLang()
  const raw = Number(value) || 0
  const normalized = raw > 0 && raw <= 1 ? Math.round(raw * 100) : Math.round(raw)
  const color = status === 'verified' ? 'bg-emerald-500' : status === 'userSubmitted' ? 'bg-amber-400' : 'bg-slate-300'
  return (
    <div className="mt-1.5">
      <div className="mb-0.5 flex justify-between text-[11px] text-slate-500">
        <span>{t('confidence')}</span>
        <span className="font-semibold">{normalized > 0 ? `${normalized}%` : '—'}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${normalized}%` }} />
      </div>
    </div>
  )
}

export default function BentoFeatures({ itinerary }) {
  const { t } = useLang()
  const hasReal = !!(itinerary && itinerary.days && itinerary.days.length)
  const acts = hasReal ? itinerary.days.flatMap((d) => d.activities || []) : []

  const samples = acts.slice(0, 3).map((a) => ({
    name: a.name,
    status: a.status || 'unverified',
    source: a.source,
    url: a.sourceUrl,
    confidence: a.confidence ?? 0,
  }))

  const crowd = acts
    .filter((a) => typeof a.capacity === 'number')
    .map((a) => ({ name: a.name, capacity: a.capacity, alts: a.alternatives || [] }))
  const flagged = crowd.find((c) => c.capacity >= 80)

  const gems = acts.filter((a) => a.local?.gem)
  const contribution = gems.length
    ? Math.round(gems.reduce((s, g) => s + (g.local.contribution || 0), 0) / gems.length)
    : 0
  const vendorsSupported = gems.length
  const moneyToCommunity = gems.length
    ? Math.round(gems.reduce((s, g) => s + (g.local.contribution || 0), 0) * 138)
    : 0

  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <span className="pill border border-emerald-200 bg-emerald-50 text-emerald-700">
          <ShieldCheck size={13} /> {t('bentoKicker')}
        </span>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold text-slate-900">
          {t('bentoTitle')}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
          {t('bentoSlogan')}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass p-5"
        >
          <h3 className="text-base font-bold text-slate-900">{t('verifyTitle')}</h3>
          <p className="mb-4 text-xs text-slate-500">{t('verifySub')}</p>
          {!hasReal && <p className="mb-4 text-xs text-amber-700">{t('demoPreview')}</p>}
          <div className="space-y-3">
            {samples.map((s) => (
              <div key={s.name} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">{s.name}</span>
                  <Badge status={s.status} />
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                  {s.url && s.source && s.source !== 'Unverified' ? (
                    <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-600 hover:underline">
                      <ExternalLink size={11} /> {s.source}
                    </a>
                  ) : (
                    <span>{s.source && s.source !== 'Unverified' ? t('sourceFrom', { src: s.source }) : t('noSource')}</span>
                  )}
                </div>
                <ConfidenceBar value={s.confidence} status={s.status} />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass p-5"
        >
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <AlertTriangle size={16} className="text-rose-500" /> {t('overTitle')}
          </h3>
          <p className="mb-4 text-xs text-slate-500">{t('overSub')}</p>
          {crowd.length === 0 ? (
            <p className="text-xs text-slate-500">{t('noLiveCapacity')}</p>
          ) : (
            <div className="space-y-2.5">
              {crowd.map((c) => (
                <div key={c.name}>
                  <div className="mb-1 flex justify-between text-xs text-slate-600">
                    <span>{c.name}</span>
                    <span className={`font-semibold ${c.capacity >= 80 ? 'text-rose-600' : c.capacity >= 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {c.capacity}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${c.capacity >= 80 ? 'bg-rose-400' : c.capacity >= 60 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                      style={{ width: `${c.capacity}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {flagged && flagged.alts?.length > 0 && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs font-semibold text-rose-700">
                ⚠ {t('fullAlert', { name: flagged.name, pct: flagged.capacity })}
              </p>
              <ul className="mt-1.5 space-y-1">
                {flagged.alts.map((a) => (
                  <li key={a.name} className="flex items-center gap-1 text-xs text-slate-600">
                    <ArrowRight size={12} className="text-emerald-600" /> {a.name}{' '}
                    <span className="text-slate-400">· {a.distance}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass p-5"
        >
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <HandHeart size={16} className="text-emerald-600" /> {t('supportTitle')}
          </h3>
          <p className="mb-4 text-xs text-slate-500">{t('supportSub')}</p>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-center">
            <div className="text-4xl font-extrabold text-emerald-700">{contribution}%</div>
            <p className="text-xs text-slate-500">{t('spendLocal')}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border border-slate-200 bg-white p-2.5">
              <div className="text-lg font-bold text-slate-900">{vendorsSupported}</div>
              <div className="text-[11px] text-slate-500">{t('localVendors')}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-2.5">
              <div className="text-lg font-bold text-slate-900">₹{moneyToCommunity}</div>
              <div className="text-[11px] text-slate-500">{t('toCommunity')}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
