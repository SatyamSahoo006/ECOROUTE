import { motion } from 'framer-motion'
import { TrendingUp, Clock, Sun } from './icons.jsx'
import { useLang } from '../i18n.jsx'

export default function PredictiveGraph({ peak, best, curve }) {
  const { t } = useLang()
  const data = curve || [
    { h: '6a', v: 12 }, { h: '8a', v: 28 }, { h: '10a', v: 52 },
    { h: '12p', v: 71 }, { h: '2p', v: 64 }, { h: '4p', v: 92 },
    { h: '6p', v: 88 }, { h: '8p', v: 47 }, { h: '10p', v: 22 },
  ]
  const max = Math.max(...data.map((d) => d.v))
  const peakPoint = data.reduce((a, b) => (b.v > a.v ? b : a))
  const bestPoint = data.reduce((a, b) => (b.v < a.v ? b : a))
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
        <TrendingUp size={13} className="text-emerald-400" /> {t('predictive')}
      </div>
      <div className="flex h-16 items-end gap-1">
        {data.map((d, i) => (
          <div key={d.h} className="flex flex-1 flex-col items-center justify-end gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.v / max) * 100}%` }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 120 }}
              className={`w-full rounded-t ${
                d.h === peakPoint.h ? 'bg-rose-400' : 'bg-emerald-500/70'
              }`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-slate-500">
        {data.map((d) => (
          <span key={d.h}>{d.h}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-300">
        <span className="flex items-center gap-1 text-rose-300">
          <Clock size={11} /> {peak}: <b>{peakPoint.h}</b>
        </span>
        <span className="flex items-center gap-1 text-emerald-300">
          <Sun size={11} /> {best}: <b>{bestPoint.h}</b>
        </span>
      </div>
    </div>
  )
}
