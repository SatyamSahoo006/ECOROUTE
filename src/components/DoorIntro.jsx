import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { Leaf, Sparkles, ArrowRight } from './icons.jsx'

export default function DoorIntro({ open, onExplore, onAccess }) {
  const { t } = useLang()
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    if (!open) return
    setOpening(false)
    const id = setTimeout(() => trigger(onExplore), 2800)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const trigger = (after) => {
    if (opening) return
    setOpening(true)
    setTimeout(() => after && after(), 1150)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <button
            onClick={() => trigger(onExplore)}
            className="absolute bottom-6 right-6 z-30 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold text-slate-700 shadow-md hover:bg-white"
            >
              {t('skipIntro')}
            </button>

          <div className="absolute bottom-24 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3 sm:flex-row">
            <button
              onClick={() => trigger(onExplore)}
              className="rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                {t('exploreCopilot')}
              </button>
            <button
              onClick={() => trigger(onAccess)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-emerald-950 shadow-glow transition hover:bg-emerald-400"
              >
                {t('accessDashboard')} <ArrowRight size={15} />
              </button>
          </div>

          <div className="relative h-full w-full [perspective:1400px]">
            <motion.div
              className="absolute left-0 top-0 h-full w-1/2 origin-left bg-gradient-to-b from-emerald-800 to-emerald-950 [backface-visibility:hidden]"
              initial={{ rotateY: 0 }}
              animate={{ rotateY: opening ? -110 : 0 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute right-0 top-0 h-full w-1/2 origin-right bg-gradient-to-b from-emerald-800 to-emerald-950 [backface-visibility:hidden]"
              initial={{ rotateY: 0 }}
              animate={{ rotateY: opening ? 110 : 0 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-0 grid place-items-center"
              animate={{ opacity: opening ? 0 : 1, scale: opening ? 0.9 : 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center text-white">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-emerald-500 shadow-glow">
                  <Leaf size={40} />
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-2xl font-extrabold">
                  <Sparkles size={20} /> EcoRoute AI
                </div>
                <p className="mt-1 text-sm text-emerald-100">{t('doorTagline')}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
