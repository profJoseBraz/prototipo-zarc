import { MapContainer, TileLayer, Polygon, CircleMarker, useMap, useMapEvent } from 'react-leaflet'
import type { Property, TalhaoInfo, SoilAnalysisPoint } from './types'
import 'leaflet/dist/leaflet.css'

interface Props {
  property: Property
  talhao: TalhaoInfo
  analises: SoilAnalysisPoint[]
  selectedIndex?: number | null
  onUpdateAnalysisPoint?: (index: number, lat: number, lng: number) => void
}

export function ZarcSoilAnalysisMap({
  property,
  talhao,
  analises,
  selectedIndex = null,
  onUpdateAnalysisPoint,
}: Props) {
  const car = property.carPolygon
  const talhaoPoly = talhao.talhaoPolygon

  const center =
    talhaoPoly?.[0] ??
    car?.[0] ?? [
      -24.043, -52.381,
    ]

  const samplePoints = buildSamplePoints(
    talhaoPoly,
    analises.map((a) => [a.lat, a.lng] as [number | undefined, number | undefined]),
  )

  return (
    <div className="real-map-wrapper">
      <MapContainer
        {...({
          center,
          zoom: 16,
          scrollWheelZoom: false,
          style: { height: '100%', width: '100%' },
        } as any)}
      >
        <TileLayer
          {...({
            attribution: '&copy; OpenStreetMap contributors',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          } as any)}
        />
        <ZarcSoilAnalysisContent
          car={car}
          talhaoPoly={talhaoPoly}
          samplePoints={samplePoints}
          selectedIndex={selectedIndex}
          onUpdateAnalysisPoint={onUpdateAnalysisPoint}
        />
      </MapContainer>
    </div>
  )
}

function buildSamplePoints(
  talhaoPolygon: [number, number][] | undefined,
  existingPoints: [number | undefined, number | undefined][],
): [number, number][] {
  if (!talhaoPolygon || talhaoPolygon.length === 0) {
    return []
  }

  const lats = talhaoPolygon.map((p) => p[0])
  const lngs = talhaoPolygon.map((p) => p[1])

  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  return existingPoints.map(([lat, lng], idx) => {
    if (lat != null && lng != null) {
      return [lat, lng]
    }
    const frac = (idx + 1) / (existingPoints.length + 1)
    const autoLat = minLat + (maxLat - minLat) * (0.3 + 0.4 * frac)
    const autoLng = minLng + (maxLng - minLng) * (0.3 + 0.4 * frac)
    return [autoLat, autoLng]
  })
}

interface ZarcSoilAnalysisContentProps {
  car?: [number, number][]
  talhaoPoly?: [number, number][]
  samplePoints: [number, number][]
  selectedIndex: number | null
  onUpdateAnalysisPoint?: (index: number, lat: number, lng: number) => void
}

function ZarcSoilAnalysisContent({
  car,
  talhaoPoly,
  samplePoints,
  selectedIndex,
  onUpdateAnalysisPoint,
}: ZarcSoilAnalysisContentProps) {
  const map = useMap()

  if (talhaoPoly && talhaoPoly.length > 0) {
    map.fitBounds(talhaoPoly as [number, number][], { padding: [20, 20] })
  } else if (car && car.length > 0) {
    map.fitBounds(car as [number, number][], { padding: [20, 20] })
  }

  return (
    <>
      {onUpdateAnalysisPoint && selectedIndex !== null && (
        <MapClickHandler
          onClick={(lat, lng) => {
            onUpdateAnalysisPoint(selectedIndex, lat, lng)
          }}
        />
      )}
      {car && (
        <Polygon positions={car} pathOptions={{ color: '#2563eb', weight: 2, fillOpacity: 0.06 }} />
      )}
      {talhaoPoly && (
        <Polygon
          positions={talhaoPoly}
          pathOptions={{ color: '#16a34a', weight: 3, fillOpacity: 0.22 }}
        />
      )}
      {samplePoints.map(([lat, lng], idx) => (
        <CircleMarker
          key={idx}
          {...({
            center: [lat, lng],
            radius: selectedIndex === idx ? 7 : 5,
            pathOptions: {
              color: selectedIndex === idx ? '#ea580c' : '#f97316',
              weight: selectedIndex === idx ? 3 : 2,
              fillOpacity: 0.9,
            },
          } as any)}
        />
      ))}
    </>
  )
}

interface MapClickHandlerProps {
  onClick: (lat: number, lng: number) => void
}

function MapClickHandler({ onClick }: MapClickHandlerProps) {
  useMapEvent('click', (e: any) => {
    onClick(e.latlng.lat, e.latlng.lng)
  })
  return null
}



