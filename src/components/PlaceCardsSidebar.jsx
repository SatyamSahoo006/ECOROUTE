import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from './icons.jsx'

function CategoryTabs({ categories, activeCategory, onSelect }) {
  return (
    <div className="flex gap-2 mb-4">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            activeCategory === cat
              ? 'bg-emerald-500 text-emerald-950'
              : 'text-slate-600 bg-white/80 hover:bg-emerald-100'
          } transition-colors`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

function LandmarkCard({ landmark, onSelect }) {
  const categoryClasses = {
    Heritage: 'bg-emerald-50 text-emerald-600',
    Nature: 'bg-emerald-50 text-emerald-600',
    'Culture & Food': 'bg-emerald-50 text-emerald-600',
    'Hidden Gems': 'bg-emerald-50 text-emerald-600',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(landmark)}
      className="group flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-400/50"
    >
      <div className="mb-3 flex w-full items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-800">{landmark.name || landmark.title}</span>
        <span className={`pill ${categoryClasses[landmark.category] || 'text-slate-500'}`}>
          {landmark.category}
        </span>
      </div>

      <p className="mb-2 text-[11px] leading-relaxed text-slate-500 overflow-hidden text-ellipsis max-w-sm">
        {landmark.shortSummary}
      </p>

<div className="mt-auto flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:underline">
        View Details <ExternalLink size={12} />
      </div>
</motion.div>
  )
}

export default function PlaceCardsSidebar({ landmarks, onLandmarkSelect }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = ['All', 'Heritage', 'Nature', 'Culture & Food', 'Hidden Gems']

  const filteredLandmarks = activeCategory === 'All'
    ? landmarks
    : landmarks.filter((l) => l.category === activeCategory)

  return (
    <div>
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLandmarks.length === 0 && (
          <p className="text-sm text-slate-500">No itinerary stops in this category yet.</p>
        )}
        {filteredLandmarks.map((landmark) => (
          <LandmarkCard
            key={landmark.id || landmark.name || landmark.title}
            landmark={landmark}
            onSelect={onLandmarkSelect}
          />
        ))}
      </div>
    </div>
  )
}