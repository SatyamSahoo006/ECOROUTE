import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Landmark, Building2, Navigation } from './icons.jsx'
import GPSRouteButton from './GPSRouteButton.jsx'

function Section({ icon: IconC, title, paragraphs }) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2 text-emerald-300">
        <IconC size={16} />
        <h3 className="text-sm font-bold uppercase tracking-wider">{title}</h3>
      </div>
      <div className="space-y-3 text-[13px] leading-relaxed text-slate-200">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  )
}

export default function PlaceDetailDrawer({ place, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    if (place) window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [place, onClose])

  return (
    <AnimatePresence>
      {place && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/50"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-md flex-col overflow-hidden border-l border-white/10 bg-slate-900/90 backdrop-blur-2xl text-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-white/10 p-5">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-emerald-300">Landmark</div>
                <h2 className="mt-1 text-2xl font-extrabold">{place.name}</h2>
                <p className="mt-1 text-xs text-slate-300">{place.tagline}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
      <Section icon={Landmark} title="Historical Background & Origins" paragraphs={place.detail.history} />
      <Section icon={Building2} title="Architectural Masterclass & Structural Secrets" paragraphs={place.detail.architecture} />
      <Section icon={Navigation} title="Sacred Etiquette, Guidelines & Visiting Windows" paragraphs={place.detail.visiting} />

              <div className="mt-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                <div className="mb-2 text-sm font-bold text-emerald-200">Live Geolocation & Routing</div>
                <GPSRouteButton place={place} />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
