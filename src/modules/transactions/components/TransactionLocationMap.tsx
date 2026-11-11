import { Map, MapControls, MapMarker, MarkerContent } from '@/components/ui/map'
import { MapPin } from 'lucide-react'
import type { TransactionLocation } from '../models/transaction.types'

export const TransactionLocationMap = ({
  location,
  onChange,
}: Readonly<{
  location: TransactionLocation
  onChange: (location: TransactionLocation) => void
}>) => (
  <div className="h-52 overflow-hidden rounded-lg border">
    <Map
      center={[location.longitude, location.latitude]}
      zoom={16}
      onMapClick={({ lng, lat }) =>
        onChange({
          latitude: lat,
          longitude: lng,
          accuracyMeters: null,
          capturedAt: new Date().toISOString(),
          source: 'MAP_PIN',
        })
      }
    >
      <MapMarker
        draggable
        longitude={location.longitude}
        latitude={location.latitude}
        onDragEnd={({ lng, lat }) =>
          onChange({
            latitude: lat,
            longitude: lng,
            accuracyMeters: null,
            capturedAt: new Date().toISOString(),
            source: 'MAP_PIN',
          })
        }
      >
        <MarkerContent className="cursor-move">
          <span
            className="bg-background text-foreground ring-border flex size-9 items-center justify-center rounded-full shadow-md ring-1"
            aria-label="Local do gasto; clique no mapa ou arraste para ajustar"
            role="img"
          >
            <MapPin className="size-4.5 stroke-[1.8]" />
          </span>
        </MarkerContent>
      </MapMarker>
      <MapControls showZoom showCompass position="top-right" />
    </Map>
  </div>
)
