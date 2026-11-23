import { motion } from 'framer-motion'

export default function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px 600px at 10% -10%, rgba(16,185,129,0.10), transparent 60%), radial-gradient(1000px 500px at 100% 0%, rgba(6,78,59,0.10), transparent 55%), #f8fafb',
        }}
      />
      <motion.div
        className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, 24, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 top-40 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl"
        animate={{ y: [0, 26, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
