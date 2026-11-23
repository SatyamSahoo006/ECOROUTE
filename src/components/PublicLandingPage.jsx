import { motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import PublicHero from './PublicHero.jsx'
import BentoFeatures from './BentoFeatures.jsx'
import LocalImpactMeter from './LocalImpactMeter.jsx'
import CarbonFootprint from './CarbonFootprint.jsx'
import Spline3DContainer from './Spline3DContainer.jsx'
import { HandHeart } from './icons.jsx'

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-8 text-center">
      {eyebrow && (
        <span className="pill border border-emerald-200 bg-emerald-50 text-emerald-700">{eyebrow}</span>
      )}
      <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold text-slate-900">{title}</h2>
      {subtitle && <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{subtitle}</p>}
    </div>
  )
}

export default function PublicLandingPage({ demo = false, onQuickPick }) {
  const { t } = useLang()
  const gems = []

  return (
    <div>
      <PublicHero demo={demo} onQuickPick={onQuickPick} />
      <BentoFeatures />

      {/* Impact */}
      <section id="impact" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionTitle
          eyebrow={<><HandHeart size={13} /> {t('impactEyebrow')}</>}
          title={t('impactTitle')}
          subtitle={t('impactSub')}
        />
        <div className="grid gap-5 md:grid-cols-2">
          <LocalImpactMeter />
          <CarbonFootprint />
        </div>
      </section>

      {/* Local Gems */}
      <section id="gems" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionTitle
          eyebrow={t('gemsEyebrow')}
          title={t('gemsTitle')}
          subtitle={t('gemsSub')}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gems.length === 0 && <p className="text-sm text-slate-500">{t('demoPreview')}</p>}
          {gems.map((g) => (
            <div key={g.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <MapPin size={18} />
              </span>
              <div>
                <div className="font-semibold text-slate-800">{g.name}</div>
                <div className="text-xs text-slate-500">{g.local.vendor}</div>
              </div>
              <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                +{g.local.contribution}%
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Immersive 3D */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionTitle
          eyebrow={t('gemsEyebrow')}
          title="Immersive Destination Preview"
          subtitle="An interactive 3D layer brings each landmark to life."
        />
        <Spline3DContainer />
      </section>
    </div>
  )
}
