import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { Icon } from './Icon.jsx'
import VerificationBadge from './VerificationBadge.jsx'
import SensitiveBadges from './SensitiveBadges.jsx'
import OvercrowdingAlert from './OvercrowdingAlert.jsx'
import PredictiveGraph from './PredictiveGraph.jsx'
import ReportModal from './ReportModal.jsx'
import { ExternalLink, Clock, BarChart3, Leaf, Flag, AlertCircle, Gem } from './icons.jsx'

function ConfidenceBar({ value }) {
  const color = value >= 90 ? 'bg-emerald-400' : value >= 70 ? 'bg-amber-400' : 'bg-rose-400'
  return (
    <div className="flex items-center gap-2">
      <BarChart3 size={13} className="text-slate-400" />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="w-9 text-right text-xs font-semibold text-slate-300">{value}%</span>
    </div>
  )
}

function CapacityBar({ value, label, t }) {
  if (typeof value !== 'number') {
    return (
      <div className="flex items-center gap-2 text-[11px] text-slate-400">
        <span className="font-semibold">{label}</span>
        <span>{t('noLiveCapacity')}</span>
      </div>
    )
  }
  const over = value >= 80
  const color = over ? 'bg-rose-400' : value >= 60 ? 'bg-amber-400' : 'bg-emerald-400'
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold text-slate-400">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className={`h-full rounded-full ${color}`} />
      </div>
      <span className={`w-9 text-right text-xs font-bold ${over ? 'text-rose-300' : 'text-slate-300'}`}>{value}%</span>
    </div>
  )
}

export default function ItineraryCard({ activity, localOnly, onSelect }) {
  const { t } = useLang()
  const [report, setReport] = useState(false)

  if (localOnly && !activity.local?.gem) return null

  const interest = activity.interest || activity.category
  const confidenceValue = Number(activity.confidence) || 0
  const confidence = confidenceValue > 0 && confidenceValue <= 1
    ? Math.round(confidenceValue * 100)
    : Math.round(confidenceValue)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect && onSelect(activity)}
      className="glass-soft relative cursor-pointer p-4 transition hover:ring-2 hover:ring-emerald-400/40"
    >
      {activity.local?.gem && (
        <div className="absolute -right-1 -top-2 rotate-3">
          <span className="pill bg-emerald-500 text-emerald-950 shadow-glow">
            <Gem size={12} /> {t('localGem')}
          </span>
        </div>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
          <Icon name={{ heritage: 'Landmark', Heritage: 'Landmark', nature: 'Trees', Nature: 'Trees', 'Culture & Food': 'Utensils', food: 'Utensils', adventure: 'Mountain', shopping: 'ShoppingBag', religious: 'Temple', beach: 'Waves', wildlife: 'Bird', 'Hidden Gems': 'Gem' }[interest] || 'MapPin'} size={16} />
        </span>
        <div className="mr-auto">
          <h4 className="text-sm font-bold text-white">{activity.name}</h4>
          <p className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock size={11} /> {activity.time}
          </p>
        </div>
        <VerificationBadge status={activity.status} />
      </div>

      <p className="mb-3 text-xs leading-relaxed text-slate-300">{activity.description}</p>

      {/* Strict fallback for missing data */}
      {activity.fallback && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          {t('fallback')}
        </div>
      )}

      {/* Source + confidence + timestamp */}
      <div className="mb-2 space-y-1.5">
        <ConfidenceBar value={confidence} />
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            {t('source')}:{' '}
            {activity.sourceUrl ? (
              <a
                href={activity.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-emerald-300 hover:underline"
              >
                {activity.source} <ExternalLink size={11} />
              </a>
            ) : (
              <span className="font-medium text-slate-300">
                {activity.source && activity.source !== 'Unverified' ? activity.source : t('sourceNotVerified')}
              </span>
            )}
          </span>
          {activity.checkedMinsAgo != null && (
            <span className="text-slate-500">{t('checked')} {activity.checkedMinsAgo} {t('minsAgo')}</span>
          )}
        </div>
      </div>

      <div className="mb-2">
        <CapacityBar value={activity.capacity} label={t('capacity')} t={t} />
      </div>

      {activity.sensitive?.length > 0 && (
        <div className="mb-2">
          <SensitiveBadges tags={activity.sensitive} />
        </div>
      )}

      {/* Overcrowding + reroute */}
      <OvercrowdingAlert activity={activity} />

      {activity.crowdPeak && activity.crowdBest && (
        <div className="mt-3">
          <PredictiveGraph peak={activity.crowdPeak} best={activity.crowdBest} />
        </div>
      )}

      {/* Local + carbon footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 text-[11px]">
        <span className="flex items-center gap-1 text-emerald-300">
           <Leaf size={12} /> {activity.carbonKg ?? 0} {t('co2')}
        </span>
        {activity.local?.gem && (
          <span className="text-slate-300">
            🤝 {activity.local.vendor} · +{activity.local.contribution}% {t('localContribution')}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setReport(true)
          }}
          className="ml-auto inline-flex items-center gap-1 text-slate-400 hover:text-rose-300"
        >
          <Flag size={12} /> {t('report')}
        </button>
      </div>

      <ReportModal open={report} onClose={() => setReport(false)} activity={activity} />
    </motion.div>
  )
}
