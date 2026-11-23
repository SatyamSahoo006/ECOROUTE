import { motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { HandHeart, Store, TrendingUp } from './icons.jsx'

export default function LocalImpactMeter({ itinerary }) {
  const { t } = useLang()
  const computed = (() => {
    if (!itinerary?.days) return { contribution: 0, vendorsSupported: 0, moneyToCommunity: 0 }
    const all = itinerary.days.flatMap((d) => d.activities)
    const gems = all.filter((a) => a.local?.gem)
    const vendorsSupported = gems.filter((a) => a.local?.vendor).length
    const contribSum = gems.reduce((s, a) => s + (Number(a.local?.contribution) || 0), 0)
    const contribution = gems.length ? Math.round(contribSum / gems.length) : 0
    const moneyToCommunity = contribSum * 1200
    return { contribution, vendorsSupported, moneyToCommunity }
  })()
  const { contribution, vendorsSupported, moneyToCommunity } = computed
  return (
    <div className="glass p-5">
      <div className="mb-3 flex items-center gap-2">
        <HandHeart size={16} className="text-emerald-400" />
        <h3 className="text-base font-bold text-white">{t('communityImpact')}</h3>
      </div>

      <div className="mb-4">
        <p className="text-xs text-slate-400">{t('localContribution')}</p>
        <div className="mt-1 flex items-end gap-1">
          <span className="text-3xl font-extrabold text-emerald-400">+{contribution}%</span>
          <TrendingUp size={20} className="mb-1 text-emerald-400" />
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${contribution}%` }}
            transition={{ duration: 1 }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-white/5 p-3">
          <Store size={16} className="mx-auto mb-1 text-emerald-300" />
          <div className="text-lg font-bold text-white">{vendorsSupported}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">{t('localVendors')}</div>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <span className="text-lg font-bold text-emerald-300">₹{moneyToCommunity.toLocaleString()}</span>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">{t('toCommunity')}</div>
        </div>
      </div>
    </div>
  )
}
