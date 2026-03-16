import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet'
import type { ZarcRequest } from './types'
import 'leaflet/dist/leaflet.css'

interface Props {
  request: ZarcRequest
}

export function ZarcMap({ request }: Props) {
  const car = request.propriedade.carPolygon
  const talhao = request.talhao.talhaoPolygon

  const center =
    talhao?.[0] ??
    car?.[0] ?? [
      -24.043, -52.381,
    ]

  return (
    <div className="real-map-wrapper">
      <MapContainer
        {...({
          center,
          zoom: 15,
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
        <ZarcMapContent car={car} talhao={talhao} />
      </MapContainer>
    </div>
  )
}

interface ZarcMapContentProps {
  car?: [number, number][]
  talhao?: [number, number][]
}

function ZarcMapContent({ car, talhao }: ZarcMapContentProps) {
  const map = useMap()

  if (car && car.length > 0) {
    const bounds = car.map(([lat, lng]) => [lat, lng]) as [number, number][]
    map.fitBounds(bounds, { padding: [20, 20] })
  } else if (talhao && talhao.length > 0) {
    const bounds = talhao.map(([lat, lng]) => [lat, lng]) as [number, number][]
    map.fitBounds(bounds, { padding: [20, 20] })
  }

  return (
    <>
      {car && (
        <Polygon positions={car} pathOptions={{ color: '#2563eb', weight: 2, fillOpacity: 0.12 }} />
      )}
      {talhao && (
        <Polygon
          positions={talhao}
          pathOptions={{ color: '#16a34a', weight: 2.2, fillOpacity: 0.22 }}
        />
      )}
    </>
  )
}

