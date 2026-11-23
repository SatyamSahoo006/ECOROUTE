import { useLang } from '../i18n.jsx'
import { motion } from 'framer-motion'
import { CheckCircle2, UserCheck, HelpCircle } from 'lucide-react'

const CONFIG = {
  verified: {
    icon: CheckCircle2,
    cls: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30',
    dot: 'bg-emerald-400',
  },
  userSubmitted: {
    icon: UserCheck,
    cls: 'bg-amber-500/15 text-amber-300 border border-amber-400/30',
    dot: 'bg-amber-400',
  },
  unverified: {
    icon: HelpCircle,
    cls: 'bg-rose-500/15 text-rose-300 border border-rose-400/30',
    dot: 'bg-rose-400',
  },
}

export default function VerificationBadge({ status = 'unverified' }) {
  const { t } = useLang()
  const c = CONFIG[status] || CONFIG.unverified
  const IconC = c.icon
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`pill ${c.cls}`}
      title={t(status)}
    >
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full ${c.dot} animate-pulseRing`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${c.dot}`} />
      </span>
      <IconC size={13} />
      {t(status)}
    </motion.span>
  )
}
