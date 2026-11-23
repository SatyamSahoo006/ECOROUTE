import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, ExternalLink, ChevronDown } from './icons.jsx'
import { fetchDestinationImage } from '../services/api'
import { useLang } from '../i18n.jsx'

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return value ? [value] : []
}

function Section({ title, paragraphs }) {
  if (!paragraphs.length) return null
  return (
    <div className="mb-4">
      <h4 className="mb-1 text-sm font-bold text-slate-800">{title}</h4>
      <div className="space-y-2 text-[13px] leading-relaxed text-slate-600">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  )
}

export default function LandmarkFeaturedView({ place, expanded, onToggle }) {
  const { t } = useLang()
  const [image, setImage] = useState(null)

  useEffect(() => {
    if (!place) return
    let cancelled = false
    setImage(null)
    fetchDestinationImage(place.imageQuery)
      .then((url) => !cancelled && setImage(url))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [place])

  if (!place) return null

  const detail = place.detail || {}
  const overview = asList(detail.overview || detail.history || [place.shortSummary, place.tagline])
  const notes = asList(detail.notes || detail.architecture)
  const guidelines = asList(detail.guidelines || detail.visiting)
  const rawSource = place.source && place.source !== 'Unverified' ? place.source : ''
  let sourceLabel = rawSource
  if (!sourceLabel && place.sourceUrl) {
    try {
      sourceLabel = new URL(place.sourceUrl).hostname
    } catch {
      sourceLabel = place.sourceUrl
    }
  }
  const dirUrl = place.coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.coords.lat},${place.coords.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.directionsQuery || place.name)}`

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-60 overflow-hidden rounded-2xl border border-slate-200 shadow-md sm:h-72">
        <AnimatePresence mode="wait">
          {image && (
            <motion.div
              key={image}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300">
            Currently Viewing
          </div>
          <h2 className="mt-1 text-2xl font-extrabold drop-shadow sm:text-3xl">{place.name}</h2>
        </div>
      </div>

      <div className="glass-soft p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-extrabold text-slate-900">{place.name}</h3>
          <span className="pill bg-amber-100 text-amber-800">{t('provisional')}</span>
        </div>

        <div className="space-y-3 text-[13px] leading-relaxed text-slate-600">
          {!expanded && overview[0] && <p className="font-medium text-slate-700">{overview[0]}</p>}
          {expanded && (
            <>
              <Section title={t('detailOverview')} paragraphs={overview} />
              <Section title={t('detailNotes')} paragraphs={notes} />
              <Section title={t('detailGuidelines')} paragraphs={guidelines} />
            </>
          )}
        </div>

        {onToggle && (
          <button
            onClick={onToggle}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
          >
            {expanded ? 'Show Less' : 'More details'}
            <ExternalLink size={12} />
            <ChevronDown size={12} className={`transition ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <MapPin size={18} className={sourceLabel ? 'text-emerald-500' : 'text-amber-500'} />
          {sourceLabel ? (
            <>
              Source:{' '}
              {place.sourceUrl ? (
                <a href={place.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 hover:underline">
                  {sourceLabel}
                </a>
              ) : (
                <span className="font-semibold text-slate-700">{sourceLabel}</span>
              )}
            </>
          ) : (
            <span className="font-semibold text-amber-700">{t('sourceNotVerified')}</span>
          )}
        </div>
        <button
          onClick={() => window.open(dirUrl, '_blank', 'noopener')}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400 active:scale-[0.98]"
        >
          <Navigation size={16} /> Get Directions
        </button>
      </div>
    </div>
  )
}
