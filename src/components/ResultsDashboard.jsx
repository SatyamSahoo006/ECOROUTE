import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import ItineraryCard from './ItineraryCard.jsx'
import LiveConditions from './LiveConditions.jsx'
import MapOverview from './MapOverview.jsx'
import LocalImpactMeter from './LocalImpactMeter.jsx'
import CarbonFootprint from './CarbonFootprint.jsx'
import OvercrowdingAlert from './OvercrowdingAlert.jsx'
import OfflineMode from './OfflineMode.jsx'
import LandmarkFeaturedView from './LandmarkFeaturedView.jsx'
import PlaceCardsSidebar from './PlaceCardsSidebar.jsx'
import { ItinerarySkeleton } from './Skeleton.jsx'
import { CalendarDays, Sparkles, HandHeart, MapPin, Save, History } from './icons.jsx'
import { saveItinerary, getUserItineraries } from '../services/api.js'
import { useToast } from './Toast.jsx'

function SectionHeader({ icon: IconC, title, subtitle }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
        {IconC && <IconC size={18} />}
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <span className="ml-auto hidden h-px flex-1 bg-slate-200 sm:block" />
    </div>
  )
}

const EMPTY_ITINERARY = { destination: '', days: [], _provenance: 'unverified' }

function categoryFromInterest(interest) {
  const value = String(interest || '').toLowerCase()
  if (value.includes('heritage')) return 'Heritage'
  if (value.includes('nature')) return 'Nature'
  if (value.includes('food') || value.includes('culture')) return 'Culture & Food'
  if (value.includes('hidden') || value.includes('gem')) return 'Hidden Gems'
  return 'Hidden Gems'
}

export default function ResultsDashboard({ form, offline, loading, itinerary }) {
  const { t } = useLang()
  const { toast } = useToast()
  const data = itinerary && itinerary.days ? itinerary : EMPTY_ITINERARY
  const all = data.days.flatMap((d) => d.activities || [])
  const flagged = all.filter((a) => typeof a.capacity === 'number' && a.capacity >= 80)
  const capacityActivities = all.filter((a) => typeof a.capacity === 'number')
  const gems = all.filter((a) => a.local?.gem)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState(null)
  const [history, setHistory] = useState([])

  // ---- Landmark featured view state (inline, no sliding drawer) ----
  const [featuredLandmark, setFeaturedLandmark] = useState(null)

  useEffect(() => {
    setSavedId(null)
    setFeaturedLandmark(null)
  }, [itinerary?.destination, itinerary?.days?.length])

  useEffect(() => {
    getUserItineraries().then(setHistory).catch(() => {})
  }, [savedId])

  const onSave = async () => {
    if (!itinerary || saving) return
    setSaving(true)
    try {
      const res = await saveItinerary(itinerary.destination || form.destination, form, itinerary)
      setSavedId(res?.id || 'saved')
      toast('Itinerary saved', 'success')
    } catch (e) {
      toast(e.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const activityToLandmark = (a) => {
    const hasCoords =
      Number.isFinite(a.lat) && Number.isFinite(a.lng) && (a.lat !== 0 || a.lng !== 0)
    const description = a.description || t('fallback')
    return {
      id: a.id,
      name: a.name,
      city: data.destination ? data.destination.split(',')[0].trim() : '',
      region: data.destination ? data.destination.split(',')[0].trim() : '',
      coords: hasCoords ? { lat: a.lat, lng: a.lng } : null,
      imageQuery: `${a.name}, ${data.destination || 'India'}`,
      directionsQuery: `${a.name}, ${data.destination || 'India'}`,
      source: a.source || 'Unverified',
      tagline: description,
      category: categoryFromInterest(a.interest || a.category),
      shortSummary: description,
      detail: {
        overview: [description],
        notes: a.sensitive?.length ? [`Locally sensitive context flagged: ${a.sensitive.join(', ')}.`] : [],
        guidelines: ['Confirm opening hours, access, safety advice, and cultural guidance locally.'],
      },
      lat: hasCoords ? a.lat : 0,
      lng: hasCoords ? a.lng : 0,
      sourceUrl: a.sourceUrl || '',
      estimatedCapacity: a.capacity,
    }
  }

  const sidebarLandmarks = all.map(activityToLandmark)

  const onLandmarkSelect = (landmark) => setFeaturedLandmark(landmark)

  return (
    <main id="results" className="mx-auto max-w-7xl scroll-mt-20 space-y-14 px-4 py-8 sm:px-6">
      <AnimatePresence>
        {offline && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <OfflineMode itinerary={itinerary} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Itinerary Stream */}
      <section id="platform">
        <SectionHeader icon={CalendarDays} title={t('itineraryTitle')} subtitle={data.destination} />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button onClick={onSave} disabled={saving || !itinerary} className="btn-primary px-4 py-2 text-xs disabled:opacity-50">
            <Save size={14} /> {savedId ? 'Saved' : saving ? 'Saving...' : 'Save itinerary'}
          </button>
          {history.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600">
              <History size={12} /> {history.length} saved
            </span>
          )}
        </div>
        {loading ? (
          <ItinerarySkeleton />
        ) : (
          <div className="space-y-7">
            {data.days.map((day, di) => (
              <motion.section
                key={day.day}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: di * 0.08 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700">
                    {day.day}
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">{day.title}</h3>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {day.activities.map((a) => (
                    <ItineraryCard key={a.id} activity={a} localOnly={form.localOnly} onSelect={onLandmarkSelect} />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </section>

      {/* 2. Conditions & Overcrowding Estimates */}
      <section id="network">
        <SectionHeader icon={Sparkles} title={t('liveConditions')} subtitle={t('rtControls')} />
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <LiveConditions destination={data.destination} />
          </div>
          <div className="space-y-4 lg:col-span-2">
            {flagged.length > 0 ? (
              flagged.map((a) => <OvercrowdingAlert key={a.id} activity={a} />)
            ) : (
              <div className="glass p-4 text-sm text-slate-600">
                {capacityActivities.length > 0 ? t('safeCapacity') : t('capacityUnavailable')}
              </div>
            )}
            <div className="glass p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">{t('occupancy')}</span>
                <span className="text-xs text-slate-500">{t('provisional')}</span>
              </div>
              {capacityActivities.length === 0 ? (
                <p className="text-sm text-slate-500">{t('noLiveCapacity')}</p>
              ) : (
                capacityActivities.map((a) => (
                  <div key={a.id} className="mb-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{a.name}</span>
                      <span className="font-semibold">{a.capacity}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          a.capacity >= 80 ? 'bg-rose-400' : a.capacity >= 60 ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${a.capacity}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sensitive Location Map & Protection */}
      <section id="map">
        <SectionHeader icon={MapPin} title={t('map')} subtitle={t('mapSub')} />
        <MapOverview itinerary={data} />
      </section>

      {/* 3b. Interactive Landmarks — inline featured view + category sidebar */}
      <section id="landmarks">
        <SectionHeader icon={MapPin} title="Landmarks" subtitle="Tap any stop from your itinerary to open its picture, story & directions." />

        {/* Featured landmark view - inline stacked: Image Banner, Description, GPS Bar */}
        {featuredLandmark && (
          <LandmarkFeaturedView place={featuredLandmark} expanded />
        )}

        {/* Category filter tabs + landmark cards sidebar - inline, no drawer */}
        <PlaceCardsSidebar
          landmarks={sidebarLandmarks}
          onLandmarkSelect={onLandmarkSelect}
        />
      </section>

      {/* 4. Support Local & Impact */}
      <section id="impact">
        <SectionHeader icon={HandHeart} title={t('communityImpact')} subtitle={t('impactDashSub')} />
        <div className="grid gap-5 md:grid-cols-3">
          <LocalImpactMeter itinerary={data} />
          <CarbonFootprint itinerary={data} />
          <div id="gems" className="glass p-5">
            <div className="mb-3 flex items-center gap-2">
              <HandHeart size={16} className="text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">{t('gemCommunity')}</h3>
            </div>
            <div className="space-y-2">
              {gems.map((g) => (
                <div key={g.id} className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5">
                  <MapPin size={14} className="text-emerald-600" />
                  <div className="text-sm">
                    <div className="font-semibold text-slate-800">{g.name}</div>
                    <div className="text-[11px] text-slate-500">{g.local.vendor}</div>
                  </div>
                  <span className="ml-auto text-xs font-bold text-emerald-700">+{g.local.contribution}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="glass-soft flex items-start gap-3 p-4 text-[11px] leading-relaxed text-slate-500">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-emerald-500" />
        {t('disclaimer')}
      </div>

      {/* LandmarkDetailModal removed - using inline LandmarkFeaturedView + PlaceCardsSidebar instead */}
    </main>
  )
}