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
    <Map center={[location.longitude, location.latitude]} zoom={16}>
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
          <span aria-label="Local do gasto; arraste para ajustar" role="img">
            <MapPin className="fill-primary text-primary-foreground size-8 drop-shadow-md" />
          </span>
        </MarkerContent>
      </MapMarker>
      <MapControls showZoom showCompass position="top-right" />
    </Map>
  </div>
)
