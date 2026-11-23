import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { AlertTriangle, MapPin, Navigation, ArrowRight } from './icons.jsx'

export default function OvercrowdingAlert({ activity }) {
  const { t } = useLang()
  const over = activity.capacity >= 80
  if (!over) return null
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 overflow-hidden rounded-xl border border-rose-400/40 bg-rose-500/10"
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <AlertTriangle size={16} className="animate-pulse text-rose-400" />
        <span className="text-sm font-bold text-rose-300">{t('overcrowd')}</span>
        <span className="ml-auto text-xs font-semibold text-rose-200/80">
          {activity.capacity}% {t('capacity')}
        </span>
      </div>
      <div className="px-3 pb-2 text-xs text-rose-200/90">
        {t('atCapacity')} {t('nearbyAlt')}
      </div>
      <div className="grid gap-2 px-3 pb-3 sm:grid-cols-3">
        <AnimatePresence>
          {(activity.alternatives || []).map((alt, i) => (
            <motion.div
              key={alt.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-2"
            >
              <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
                <MapPin size={12} /> {alt.name}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1">
                  <Navigation size={10} className="text-emerald-400" /> {t('estTravel')}: {alt.travel}
                </span>
                <span>{alt.distance}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="border-t border-rose-400/20 px-3 py-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
          <ArrowRight size={12} /> {t('reroute')}
        </span>
      </div>
    </motion.div>
  )
}
