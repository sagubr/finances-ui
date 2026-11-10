import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Field } from '@/components/ui/field'
import { todayCivilDate } from '@/utils/date'
import { AlertTriangle, Check, ChevronDown, MapPin, Trash2 } from 'lucide-react'
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import type { TransactionLocation } from '../models/transaction.types'

const LocationMap = lazy(() =>
  import('./TransactionLocationMap').then(({ TransactionLocationMap }) => ({
    default: TransactionLocationMap,
  })),
)

class LocationMapBoundary extends Component<
  Readonly<{ children: ReactNode }>,
  Readonly<{ failed: boolean }>
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed)
      return (
        <div className="bg-muted text-muted-foreground rounded-lg border p-4 text-sm">
          O mapa não pôde ser carregado. A localização continuará vinculada ao lançamento.
        </div>
      )
    return this.props.children
  }
}

export const TransactionLocationField = ({
  value,
  occurredOn,
  onChange,
  autoCapture = false,
}: Readonly<{
  value: TransactionLocation | null
  occurredOn: string
  onChange: (location: TransactionLocation | null) => void
  autoCapture?: boolean
}>) => {
  const { isLoading, error, request } = useCurrentLocation()
  const isHistorical = occurredOn !== todayCivilDate()
  const requested = useRef(false)
  const [mapOpen, setMapOpen] = useState(false)

  useEffect(() => {
    if (!autoCapture || value || requested.current) return
    requested.current = true
    void request().then((location) => {
      if (location) onChange(location)
    })
  }, [autoCapture, onChange, request, value])

  return (
    <Field className="rounded-lg border px-3 py-2.5">
      <Collapsible open={mapOpen} onOpenChange={setMapOpen}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full">
            {value ? (
              <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <MapPin className="text-muted-foreground size-4" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Localização</p>
            <p className="text-muted-foreground truncate text-xs">
              {isLoading
                ? 'Obtendo automaticamente…'
                : value
                  ? `Adicionada${value.accuracyMeters !== null ? ` · precisão de ${Math.round(value.accuracyMeters)} m` : ' · ajustada no mapa'}`
                  : error || 'Opcional · salva quando disponível'}
            </p>
          </div>
          {value && (
            <div className="flex shrink-0 items-center gap-1">
              <CollapsibleTrigger
                render={
                  <Button type="button" variant="ghost" size="sm" aria-label="Ajustar localização">
                    Ajustar
                    <ChevronDown
                      className={`size-3.5 transition-transform ${mapOpen ? 'rotate-180' : ''}`}
                    />
                  </Button>
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remover localização"
                onClick={() => onChange(null)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        {value && (
          <CollapsibleContent>
            <div className="mt-3 space-y-3 border-t pt-3">
              {isHistorical && (
                <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300" />
                  <p>Localização atual. Ajuste o ponto se o gasto ocorreu em outro local.</p>
                </div>
              )}
              <LocationMapBoundary key={`${value.latitude}-${value.longitude}-${value.source}`}>
                <Suspense
                  fallback={<div className="bg-muted h-52 animate-pulse rounded-lg border" />}
                >
                  <LocationMap location={value} onChange={onChange} />
                </Suspense>
              </LocationMapBoundary>
              <p className="text-muted-foreground font-mono text-[11px]">
                {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
              </p>
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
      {isLoading && (
        <span role="status" className="sr-only">
          Obtendo localização automaticamente
        </span>
      )}
      {error && !value && (
        <span role="status" className="sr-only">
          {error}
        </span>
      )}
    </Field>
  )
}
