import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { fetchLiveConditions } from '../services/api'
import { Icon } from './Icon.jsx'
import { CloudSun, Wind, Droplets, Radio } from './icons.jsx'

const SEV = {
  ok: 'text-emerald-300',
  warn: 'text-amber-300',
  alert: 'text-rose-300',
}

function conditionToIcon(condition = '') {
  const c = condition.toLowerCase()
  if (c.includes('rain') || c.includes('drizzle') || c.includes('storm')) return 'Droplets'
  if (c.includes('clear') || c.includes('sun')) return 'Sun'
  if (c.includes('wind')) return 'Wind'
  return 'CloudSun'
}

export default function LiveConditions({ destination }) {
  const { t } = useLang()
  const [weather, setWeather] = useState({
    icon: 'CloudSun',
    temp: '—',
    condition: 'Checking live source…',
    humidity: '—',
    wind: '—',
  })
  const [crowd, setCrowd] = useState(null)
  const [transit, setTransit] = useState(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    setCrowd(null)
    setTransit(null)
    setLive(false)
    fetchLiveConditions(destination)
      .then((data) => {
        if (!data?.weather || cancelled) return
        const w = data.weather
        setLive(data.simulated === false)
        setCrowd(data.crowd || null)
        setTransit(data.transit || null)
        setWeather({
          icon: conditionToIcon(w.condition),
          temp: w.temp,
          condition: w.condition,
          humidity: w.humidity,
          wind: w.wind,
        })
      })
      .catch(() => {
        if (cancelled) return
        setLive(false)
        setWeather({
          icon: 'CloudSun',
          temp: '—',
          condition: 'Live conditions unavailable',
          humidity: '—',
          wind: '—',
        })
      })
    return () => {
      cancelled = true
    }
  }, [destination])

  return (
    <div className="glass p-5">
      <div className="mb-3 flex items-center gap-2">
        <Radio size={16} className="text-emerald-400" />
        <h3 className="text-base font-bold text-white">{t('liveConditions')}</h3>
        {live ? (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> {t('liveBadge')}
          </span>
        ) : (
          <span className="ml-auto text-[10px] text-amber-300">{t('provisional')}</span>
        )}
      </div>

      <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
        <Icon name={weather.icon} size={28} className="text-emerald-300" />
        <div>
          <div className="text-xl font-bold text-white">{weather.temp}°C</div>
          <div className="text-[11px] text-slate-400">{weather.condition}</div>
        </div>
        <div className="ml-auto flex flex-col gap-1 text-[11px] text-slate-300">
          <span className="flex items-center gap-1"><Droplets size={11} /> {weather.humidity}%</span>
          <span className="flex items-center gap-1"><Wind size={11} /> {weather.wind} km/h</span>
        </div>
      </div>

      {crowd?.available && (
        <div className="mb-3 rounded-xl bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t('capacity')}
            <span className="ml-auto text-sm font-bold text-emerald-300">{crowd.capacity ?? '—'}%</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">{crowd.source} · {crowd.capacitySource}</div>
        </div>
      )}

      {transit?.notes?.length > 0 && (
        <>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('transport')}</div>
          <div className="mt-1 space-y-1">
            {transit.notes.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] ${SEV[item.severity] || SEV.warn}`}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                {item.text}
              </motion.div>
            ))}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">{transit.network} · {transit.source}</div>
        </>
      )}
    </div>
  )
}
