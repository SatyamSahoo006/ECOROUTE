import { useAuth } from '../context/AuthContext.jsx'
import HeroSection from './HeroSection.jsx'
import BentoFeatures from './BentoFeatures.jsx'
import ResultsDashboard from './ResultsDashboard.jsx'

export default function AppDashboard({ form, setForm, onGenerate, onQuickPick, demo, loading, generated, itinerary }) {
  const { offline } = useAuth()
  return (
    <div>
      <HeroSection
        form={form}
        setForm={setForm}
        onGenerate={onGenerate}
        onQuickPick={onQuickPick}
        demo={demo}
        loading={loading}
      />
      <BentoFeatures itinerary={generated ? itinerary : null} />
      {generated && <ResultsDashboard form={form} offline={offline} loading={loading} itinerary={itinerary} />}
    </div>
  )
}
