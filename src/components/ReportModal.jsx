import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { X, Flag, Send } from './icons.jsx'

export default function ReportModal({ open, onClose, activity }) {
  const { t } = useLang()
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-md p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <Flag size={16} className="text-rose-400" /> {t('reportTitle')}
              </h3>
              <button onClick={onClose} className="rounded-lg p-1 hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            <p className="mb-3 text-sm text-slate-300">{t('reportBody')}</p>
            {activity && (
              <div className="mb-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300">
                <b className="text-white">{activity.name}</b> ·{' '}
                <span className="text-emerald-300">{t(activity.status)}</span>
              </div>
            )}
            <textarea
              rows={3}
              placeholder="…"
              className="mb-3 w-full resize-none rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400/40"
            />
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5">
                {t('cancel')}
              </button>
              <button onClick={onClose} className="btn-primary flex-1">
                <Send size={14} /> {t('submitReport')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
