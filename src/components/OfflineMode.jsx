import { motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { EMERGENCY } from '../data/mockData.js'
import { WifiOff, Phone, CheckSquare, FileText } from './icons.jsx'

export default function OfflineMode({ itinerary }) {
  const { t } = useLang()
  const data = itinerary?.days ? itinerary : { destination: '', days: [] }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border border-amber-400/30 p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <WifiOff size={18} className="text-amber-400" />
        <h3 className="text-base font-bold text-white">{t('offlineChecklist')}</h3>
        <span className="ml-auto pill bg-amber-500/15 text-amber-300">{t('offlineOn')}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <FileText size={13} /> {data.destination || t('offlineMode')}
          </div>
          <div className="space-y-2">
            {data.days.map((d) => (
              <div key={d.day} className="rounded-lg bg-white/5 p-2">
                <div className="mb-1 text-xs font-bold text-emerald-300">
                  {t('day')} {d.day} — {d.title}
                </div>
                {d.activities.map((a) => (
                  <div key={a.id} className="flex items-start gap-2 py-0.5 text-[11px] text-slate-300">
                    <CheckSquare size={12} className="mt-0.5 shrink-0 text-slate-500" />
                    <span>
                      <b className="text-white">{a.time}</b> · {a.name}
                      {a.local.gem && <span className="text-emerald-300"> (Local)</span>}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Phone size={13} /> {t('emergency')}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EMERGENCY.map((e) => (
              <div key={e.name} className="rounded-lg bg-rose-500/10 px-3 py-2">
                <div className="text-[11px] text-slate-300">{e.name}</div>
                <div className="text-sm font-bold text-rose-300">{e.number}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-white/5 p-3 text-[11px] leading-relaxed text-slate-300">
            <b className="text-amber-300">{t('essentials')}:</b> Carry printed copies, offline maps cached,
            sufficient water, and verify opening hours locally. Sensitive sites may restrict photography.
          </div>
        </div>
      </div>
    </motion.div>
  )
}
