import { useLang } from '../i18n.jsx'
import { Landmark, Users, Leaf } from './icons.jsx'

const CFG = {
  cultural: { icon: Landmark, label: 'cultural', cls: 'bg-purple-500/15 text-purple-300 border-purple-400/30' },
  tribal: { icon: Users, label: 'tribal', cls: 'bg-orange-500/15 text-orange-300 border-orange-400/30' },
  fragile: { icon: Leaf, label: 'fragile', cls: 'bg-teal-500/15 text-teal-300 border-teal-400/30' },
}

export default function SensitiveBadges({ tags = [] }) {
  const { t } = useLang()
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const c = CFG[tag] || CFG.cultural
        const IconC = c.icon
        return (
          <span key={tag} className={`pill ${c.cls}`}>
            <IconC size={12} /> {t(c.label)}
          </span>
        )
      })}
    </div>
  )
}
