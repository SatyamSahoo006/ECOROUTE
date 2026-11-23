import { motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { Leaf, Coins, Building2 } from './icons.jsx'

export default function CarbonFootprint({ itinerary }) {
  const { t } = useLang()
  const all = itinerary?.days?.flatMap((d) => d.activities || []) || []
  const gems = all.filter((a) => a.local?.gem)
  const totalKg = Math.round(all.reduce((s, a) => s + (Number(a.carbonKg) || 0), 0) * 10) / 10
  const localInjectedPct = gems.length
    ? Math.round(gems.reduce((s, g) => s + (Number(g.local?.contribution) || 0), 0) / gems.length)
    : 0
  const breakdown = all.length ? [{ mode: 'Planned stops', kg: totalKg, local: gems.length > 0 }] : []
  const max = breakdown.length ? Math.max(...breakdown.map((b) => b.kg), 1) : 1

  return (
    <div className="glass p-5">
      <div className="mb-3 flex items-center gap-2">
        <Leaf size={16} className="text-emerald-400" />
        <h3 className="text-base font-bold text-white">{t('carbon')}</h3>
        <span className="ml-auto text-[10px] text-amber-300">{t('provisional')}</span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white/5 p-3">
          <div className="text-lg font-bold text-emerald-300">{totalKg} kg</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">{t('footprint')}</div>
        </div>
        <div className="rounded-xl bg-emerald-500/10 p-3">
          <div className="text-lg font-bold text-emerald-300">{localInjectedPct}%</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">{t('toCommunity')}</div>
        </div>
        <div className="rounded-xl bg-rose-500/10 p-3">
          <div className="text-lg font-bold text-rose-300">{localInjectedPct ? 100 - localInjectedPct : 0}%</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">{t('toCorporate')}</div>
        </div>
      </div>

      <div className="space-y-2">
        {breakdown.map((b, i) => (
          <div key={b.mode} className="flex items-center gap-2">
            <span className="w-24 text-[11px] text-slate-300">{b.mode}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(b.kg / max) * 100}%` }}
                transition={{ delay: i * 0.08 }}
                className={`h-full rounded-full ${b.local ? 'bg-emerald-400' : 'bg-rose-400/70'}`}
              />
            </div>
            <span className="w-10 text-right text-[11px] text-slate-400">{b.kg}kg</span>
          </div>
        ))}
        {breakdown.length === 0 && <p className="text-xs text-slate-500">{t('noLiveCapacity')}</p>}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-[11px]">
        <span className="flex items-center gap-1 text-emerald-300">
          <Coins size={12} /> {t('toCommunity')}
        </span>
        <span className="flex items-center gap-1 text-rose-300">
          <Building2 size={12} /> {t('toCorporate')}
        </span>
      </div>
    </div>
  )
}
