import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Sparkles } from './icons.jsx'

export default function DoorReveal({ open, onSkip }) {
  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => onSkip(), 2300)
    return () => clearTimeout(id)
  }, [open, onSkip])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            onClick={onSkip}
            className="absolute right-4 top-4 z-20 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold text-slate-700 shadow-md hover:bg-white"
          >
            Skip Intro
          </button>

          <motion.div
            className="h-full w-1/2 bg-gradient-to-b from-emerald-800 to-emerald-950"
            initial={{ x: 0 }}
            animate={{ x: '-100%' }}
            exit={{ x: '-100%' }}
            transition={{ delay: 1.1, duration: 0.9, ease: 'easeInOut' }}
          />
          <motion.div
            className="h-full w-1/2 bg-gradient-to-b from-emerald-800 to-emerald-950"
            initial={{ x: 0 }}
            animate={{ x: '100%' }}
            exit={{ x: '100%' }}
            transition={{ delay: 1.1, duration: 0.9, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute inset-0 grid place-items-center"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0.85 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="text-center text-white">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-emerald-500 shadow-glow">
                <Leaf size={40} />
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-2xl font-extrabold">
                <Sparkles size={20} /> EcoRoute AI
              </div>
              <p className="mt-1 text-sm text-emerald-100">Source-aware Destination Copilot</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
