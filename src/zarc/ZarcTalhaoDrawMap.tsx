import { MapContainer, TileLayer, Polygon, CircleMarker, useMapEvent } from 'react-leaflet'
import type { TalhaoInfo, Property } from './types'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'

interface Props {
  property: Property
  talhao: TalhaoInfo
  onChangeTalhaoPolygon: (coords: [number, number][]) => void
  onTalhaoDrawn: () => void
}

export function ZarcTalhaoDrawMap({ property, talhao, onChangeTalhaoPolygon, onTalhaoDrawn }: Props) {
  const car = property.carPolygon
  const [tempPolygon, setTempPolygon] = useState<[number, number][]>(talhao.talhaoPolygon ?? [])
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null)

  const center = car?.[0] ?? [-24.043, -52.381] as [number, number]

  const handleMapClick = (lat: number, lng: number) => {
    // Se houver um vértice selecionado, move esse ponto em vez de adicionar um novo
    if (selectedVertexIndex !== null && tempPolygon[selectedVertexIndex]) {
      const next = tempPolygon.map((p, idx) => (idx === selectedVertexIndex ? [lat, lng] : p)) as [
        number,
        number,
      ][]
      setTempPolygon(next)
      setSelectedVertexIndex(null)
      return
    }

    const next = [...tempPolygon, [lat, lng] as [number, number]]
    setTempPolygon(next)
  }

  const handleConfirm = () => {
    if (tempPolygon.length >= 3) {
      onChangeTalhaoPolygon(tempPolygon)
      onTalhaoDrawn()
    }
  }

  const handleClear = () => {
    setTempPolygon([])
    onChangeTalhaoPolygon([])
    setSelectedVertexIndex(null)
  }

  const handleUndo = () => {
    if (tempPolygon.length === 0) return
    const next = tempPolygon.slice(0, -1)
    setTempPolygon(next)
    onChangeTalhaoPolygon(next)
    if (selectedVertexIndex !== null && selectedVertexIndex >= next.length) {
      setSelectedVertexIndex(null)
    }
  }

  return (
    <div className="real-map-wrapper">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {car && (
          <Polygon
            positions={car}
            pathOptions={{ color: '#3b82f6', weight: 2, fillOpacity: 0.08 }}
          />
        )}
        {tempPolygon.length > 0 && (
          <>
            <Polygon
              positions={tempPolygon}
              pathOptions={{ color: '#22c55e', weight: 2, fillOpacity: 0.25 }}
            />
            {tempPolygon.map(([lat, lng], idx) => (
              <CircleMarker
                key={`${lat}-${lng}-${idx}`}
                center={[lat, lng]}
                radius={selectedVertexIndex === idx ? 8 : 6}
                pathOptions={{
                  color: selectedVertexIndex === idx ? '#f97316' : '#22c55e',
                  weight: 2,
                  fillColor: selectedVertexIndex === idx ? '#fed7aa' : '#bbf7d0',
                  fillOpacity: 0.9,
                }}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.stopPropagation()
                    setSelectedVertexIndex(idx)
                  },
                }}
              />
            ))}
          </>
        )}
        <ClickHandler onClick={handleMapClick} />
      </MapContainer>
      <div className="map-draw-toolbar">
        <span className="map-draw-hint">
          Clique no mapa para adicionar vértices do talhão. Clique em um ponto para selecioná-lo e, em
          seguida, clique no mapa para reposicioná-lo. Mínimo de 3 pontos.
        </span>
        <div className="footer-nav-right">
          <button className="btn ghost" type="button" onClick={handleUndo} disabled={tempPolygon.length === 0}>
            Desfazer último ponto
          </button>
          <button className="btn ghost" type="button" onClick={handleClear}>
            Limpar desenho
          </button>
          <button
            className="btn primary"
            type="button"
            onClick={handleConfirm}
            disabled={tempPolygon.length < 3}
          >
            Concluir talhão ✅
          </button>
        </div>
      </div>
    </div>
  )
}

interface ClickHandlerProps {
  onClick: (lat: number, lng: number) => void
}

function ClickHandler({ onClick }: ClickHandlerProps) {
  useMapEvent('click', (e) => {
    onClick(e.latlng.lat, e.latlng.lng)
  })
  return null
}

