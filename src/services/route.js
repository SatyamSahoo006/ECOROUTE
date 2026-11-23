function hasCoordinates(activity) {
  return (
    Number.isFinite(activity?.lat) &&
    Number.isFinite(activity?.lng) &&
    (activity.lat !== 0 || activity.lng !== 0)
  )
}

export function buildItineraryStops(itinerary, destination) {
  const label = String(destination || itinerary?.destination || '').trim()
  const city = label.split(',')[0].trim()
  const activities = itinerary?.days?.flatMap((day) => day.activities || []) || []

  return activities.map((activity, index) => {
    const name = String(activity?.name || `Stop ${index + 1}`)
    const query = hasCoordinates(activity)
      ? `${activity.lat},${activity.lng}`
      : `${name}${city ? `, ${city}` : ''}`.trim()
    return { name, query, lat: activity.lat, lng: activity.lng }
  })
}

export function decodePolyline(encoded) {
  if (!encoded || typeof encoded !== 'string') return []
  const points = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let result = 0
    let shift = 0
    let byte = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1

    result = 0
    shift = 0
    byte = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1

    points.push([lat / 1e5, lng / 1e5])
  }
  return points
}
