import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom HTML markers avoid Leaflet's broken default icon assets under bundlers.
const makeIcon = (color) =>
  L.divIcon({
    className: 'ecoroute-pin',
    html: `<span style="display:block;width:16px;height:16px;border-radius:999px;background:${color};border:2px solid #fff;box-shadow:0 0 0 3px ${color}55"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  })

const GREEN = makeIcon('#10b981')
const RED = makeIcon('#f43f5e')
const USER = L.divIcon({
  className: 'ecoroute-user',
  html: `<span style="display:block;width:18px;height:18px;border-radius:999px;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 4px #3b82f655"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function FitRoute({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions?.length > 1) map.fitBounds(positions, { padding: [24, 24] })
  }, [positions, map])
  return null
}

export default function MapView({ center, points = [], userPos = null, routePositions = null }) {
  const recommended = points.filter((p) => p.kind !== 'flagged')
  const flagged = points.filter((p) => p.kind === 'flagged')
  const recPositions = recommended.map((p) => [p.lat, p.lng])
  const flagPositions = flagged.map((p) => [p.lat, p.lng])
  const hasRoadRoute = Array.isArray(routePositions) && routePositions.length > 1
  const userLine =
    !hasRoadRoute && userPos && center
      ? [[userPos.lat, userPos.lng], [center.lat, center.lng]]
      : null

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {hasRoadRoute && <FitRoute positions={routePositions} />}
      {!hasRoadRoute && recPositions.length > 1 && (
        <Polyline positions={recPositions} pathOptions={{ color: '#10b981', weight: 3, dashArray: '6 6' }} />
      )}
      {!hasRoadRoute && flagPositions.length > 1 && (
        <Polyline positions={flagPositions} pathOptions={{ color: '#f43f5e', weight: 3, dashArray: '6 6' }} />
      )}
      {hasRoadRoute && (
        <Polyline positions={routePositions} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.9 }} />
      )}
      {userLine && (
        <Polyline positions={userLine} pathOptions={{ color: '#3b82f6', weight: 4 }} />
      )}
      {userPos && <Marker position={[userPos.lat, userPos.lng]} icon={USER} />}
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={p.kind === 'flagged' ? RED : GREEN}>
          <Popup>
            <div className="min-w-[160px]">
              <div className="text-sm font-bold text-slate-800">{p.name}</div>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-600">
                <span>Confidence: {p.confidence}%</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    p.kind === 'flagged' ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                />
                <span className={p.kind === 'flagged' ? 'text-rose-600' : 'text-emerald-700'}>
                  {p.kind === 'flagged' ? 'Overcrowded / Sensitive' : 'Recommended'} · {p.capacity}% capacity
                </span>
              </div>
              {p.source && (
                <div className="mt-1 truncate text-[11px] text-slate-400">{p.source}</div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
