import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from './icons.jsx'
import LandmarkFeaturedView from './LandmarkFeaturedView.jsx'

export default function LandmarkDetailModal({ place, onClose }) {
  useEffect(() => {
    if (!place) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [place, onClose])

  return (
    <AnimatePresence>
      {place && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-3xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white"
            >
              <X size={18} />
            </button>
            <LandmarkFeaturedView place={place} expanded onToggle={() => {}} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
