import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n.jsx'
import { Icon } from './Icon.jsx'
import { INTERESTS, ACCESSIBILITY, BUDGETS, DESTINATION_SUGGESTIONS } from '../data/mockData.js'
import { MapPin, Plus, Minus, Wand2, Loader2, Accessibility, Sparkles } from './icons.jsx'

function Counter({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
        >
          <Minus size={14} />
        </button>
        <span className="w-5 text-center font-bold text-slate-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-400"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

export default function ItineraryForm({ data, setData, onSubmit, loading }) {
  const { t } = useLang()
  const [showSuggest, setShowSuggest] = useState(false)

  const toggle = (key, id) =>
    setData((d) => ({
      ...d,
      [key]: d[key].includes(id) ? d[key].filter((x) => x !== id) : [...d[key], id],
    }))

  const suggestions = DESTINATION_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(data.destination.toLowerCase())
  )

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-1">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-emerald-500" />
        <h2 className="text-base font-bold text-slate-900">{t('buildTitle')}</h2>
      </div>

      {/* Destination with autocomplete */}
      <div className="relative mb-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t('destination')}
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
          <MapPin size={16} className="text-emerald-500" />
          <input
            value={data.destination}
            onChange={(e) => {
              setData((d) => ({ ...d, destination: e.target.value }))
              setShowSuggest(true)
            }}
            onFocus={() => setShowSuggest(true)}
            onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
            placeholder={t('destinationPlaceholder')}
            className="w-full bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
        </div>
        {showSuggest && suggestions.length > 0 && (
          <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => {
                  setData((d) => ({ ...d, destination: s }))
                  setShowSuggest(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50"
              >
                <MapPin size={13} className="text-emerald-500" /> {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t('dates')}
        </label>
        <input
          type="date"
          value={data.dates}
          onChange={(e) => setData((d) => ({ ...d, dates: e.target.value }))}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none [color-scheme:light]"
        />
      </div>

      {/* Travelers */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Counter label={t('adults')} value={data.travelers.adults} onChange={(v) => setData((d) => ({ ...d, travelers: { ...d.travelers, adults: v } }))} />
        <Counter label={t('children')} value={data.travelers.children} onChange={(v) => setData((d) => ({ ...d, travelers: { ...d.travelers, children: v } }))} />
        <Counter label={t('seniors')} value={data.travelers.seniors} onChange={(v) => setData((d) => ({ ...d, travelers: { ...d.travelers, seniors: v } }))} />
      </div>

      {/* Budget */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('budget')}</label>
        <div className="flex gap-2">
          {BUDGETS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setData((d) => ({ ...d, budget: b.id }))}
              className={`flex-1 rounded-xl border px-3 py-2 text-center transition ${
                data.budget === b.id
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="text-lg font-extrabold">{b.label}</div>
              <div className="text-[10px] uppercase tracking-wide opacity-70">{t('budget' + b.id[0].toUpperCase() + b.id.slice(1))}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Pacing */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('pacing')}</label>
        <div className="flex gap-2">
          {['relaxed', 'balanced', 'packed'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setData((d) => ({ ...d, pacing: p }))}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                data.pacing === p
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('interests')}</label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => {
            const active = data.interests.includes(i.id)
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => toggle('interests', i.id)}
                className={`pill border transition ${
                  active
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon name={i.icon} size={13} /> {t(i.id)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Accessibility */}
      <div className="mb-4">
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Accessibility size={13} className="text-emerald-500" /> {t('accessibility')}
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ACCESSIBILITY.map((a) => {
            const active = data.accessibility.includes(a.id)
            return (
              <label
                key={a.id}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                  active ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggle('accessibility', a.id)}
                  className="h-4 w-4 accent-emerald-500"
                />
                 {t(a.id)}
              </label>
            )
          })}
        </div>
      </div>

      {/* Special requests */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('specialRequests')}</label>
        <textarea
          value={data.requests}
          onChange={(e) => setData((d) => ({ ...d, requests: e.target.value }))}
          placeholder={t('requestsPlaceholder')}
          rows={2}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-400"
        />
      </div>

      {/* Local only */}
      <label className="mb-5 flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <span className="text-sm font-medium text-slate-700">{t('localOnly')}</span>
        <span className="text-[11px] text-slate-400">{t('localOnlyDesc')}</span>
        <span
          type="button"
          onClick={() => setData((d) => ({ ...d, localOnly: !d.localOnly }))}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${data.localOnly ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${data.localOnly ? 'left-[22px]' : 'left-0.5'}`} />
        </span>
      </label>

      <button onClick={onSubmit} disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
        {loading ? t('generating') : t('generate')}
      </button>
    </motion.div>
  )
}
