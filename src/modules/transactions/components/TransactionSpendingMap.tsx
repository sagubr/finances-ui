import { ResourceErrorState } from '@/components/ResourceErrorState'
import { Button } from '@/components/ui/button'
import { Map as InteractiveMap, MapClusterLayer, MapControls, useMap } from '@/components/ui/map'
import { cn } from '@/lib/utils'
import { formatDatePtBr } from '@/utils/date'
import type { FeatureCollection, Point } from 'geojson'
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Coffee,
  GraduationCap,
  HeartPulse,
  Home,
  Layers3,
  MapPin,
  Plane,
  Receipt,
  Satellite,
  Shirt,
  ShoppingCart,
  Utensils,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { TransactionMap, TransactionMapFeatureProperties } from '../models/transaction.types'
import { formatMoney } from '../utils/money'

const satelliteStyle = import.meta.env.VITE_MAP_STYLE_SATELLITE_URL?.trim()
const fallbackCategoryColor = '#27845a'
const MAP_STYLE_STORAGE_KEY = 'transaction-map-style'

type SpendingPointProperties = TransactionMapFeatureProperties & {
  amountLabel: string
  selected: boolean
  hovered: boolean
}

const categoryIcon = (categoryName: string | null): LucideIcon => {
  const category = categoryName?.toLocaleLowerCase('pt-BR') ?? ''
  if (/(mercado|supermercado|compras)/.test(category)) return ShoppingCart
  if (/(restaurante|alimentação|comida|delivery)/.test(category)) return Utensils
  if (/(café|cafe)/.test(category)) return Coffee
  if (/(transporte|combustível|carro|estacionamento)/.test(category)) return Car
  if (/(casa|moradia|aluguel)/.test(category)) return Home
  if (/(saúde|saude|farmácia|farmacia)/.test(category)) return HeartPulse
  if (/(educação|educacao|curso)/.test(category)) return GraduationCap
  if (/(viagem|passagem|hotel)/.test(category)) return Plane
  if (/(roupa|vestuário|vestuario)/.test(category)) return Shirt
  return Receipt
}

const formatPointAmount = (amountCents: number) => {
  const amount = amountCents / 100
  if (amount >= 1_000)
    return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(amount / 1_000)}k`
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(amount)
}

const FitMapToExpenses = ({ data }: Readonly<{ data: TransactionMap }>) => {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded || data.features.length === 0) return
    const coordinates = data.features.map((feature) => feature.geometry.coordinates)
    if (coordinates.length === 1) {
      map.easeTo({ center: coordinates[0], zoom: 15, duration: 500 })
      return
    }
    const longitudes = coordinates.map(([longitude]) => longitude)
    const latitudes = coordinates.map(([, latitude]) => latitude)
    map.fitBounds(
      [
        [Math.min(...longitudes), Math.min(...latitudes)],
        [Math.max(...longitudes), Math.max(...latitudes)],
      ],
      {
        padding: { top: 72, right: 72, bottom: 72, left: window.innerWidth >= 768 ? 360 : 72 },
        maxZoom: 15,
        duration: 500,
      },
    )
  }, [data, isLoaded, map])

  return null
}

const FocusMapPoint = ({ coordinates }: Readonly<{ coordinates: [number, number] | null }>) => {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded || !coordinates) return
    map.flyTo({ center: coordinates, zoom: Math.max(map.getZoom(), 14), duration: 700 })
  }, [coordinates, isLoaded, map])

  return null
}

const ExpenseMarkerLayer = ({
  data,
  currency,
  onSelect,
  onHover,
}: Readonly<{
  data: FeatureCollection<Point, SpendingPointProperties>
  currency: string
  onSelect: (transactionId: string) => void
  onHover: (transactionId: string | null) => void
}>) => {
  const { resolvedTheme } = useMap()
  const clusterColors: [string, string, string] =
    resolvedTheme === 'dark' ? ['#34d399', '#10b981', '#047857'] : ['#22c55e', '#15803d', '#14532d']
  const pointColor = resolvedTheme === 'dark' ? '#34d399' : '#27845a'

  return (
    <MapClusterLayer
      data={data}
      clusterRadius={58}
      clusterThresholds={[5, 15]}
      clusterColors={clusterColors}
      clusterValueProperty="amountCents"
      clusterValueCurrency={currency}
      pointColor={pointColor}
      pointColorProperty="categoryColor"
      pointLabelProperty="amountLabel"
      pointSelectedProperty="selected"
      pointHoveredProperty="hovered"
      onPointClick={(feature) => onSelect(feature.properties.transactionId)}
      onPointMouseEnter={(feature) => onHover(feature.properties.transactionId)}
      onPointMouseLeave={() => onHover(null)}
    />
  )
}

export const TransactionSpendingMap = ({
  data,
  currency,
  isLoading,
  error,
  isRetrying,
  onRetry,
}: Readonly<{
  data?: TransactionMap
  currency: string
  isLoading: boolean
  error: unknown
  isRetrying: boolean
  onRetry: () => void
}>) => {
  const [selected, setSelected] = useState<TransactionMap['features'][number] | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [focusCoordinates, setFocusCoordinates] = useState<[number, number] | null>(null)
  const [satellite, setSatellite] = useState(() => {
    if (!satelliteStyle || typeof window === 'undefined') return false
    try {
      return localStorage.getItem(MAP_STYLE_STORAGE_KEY) !== 'map'
    } catch {
      return true
    }
  })
  const geojson = useMemo<FeatureCollection<Point, SpendingPointProperties>>(
    () => ({
      type: 'FeatureCollection',
      features: (data?.features ?? []).map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          categoryColor: feature.properties.categoryColor ?? fallbackCategoryColor,
          amountLabel: formatPointAmount(feature.properties.amountCents),
          selected: selected?.id === feature.id,
          hovered: hoveredId === feature.properties.transactionId,
        },
      })),
    }),
    [data, hoveredId, selected?.id],
  )
  const navigableExpenses = useMemo(
    () =>
      [...(data?.features ?? [])].sort(
        (left, right) => right.properties.amountCents - left.properties.amountCents,
      ),
    [data],
  )
  const rankedExpenses = navigableExpenses.slice(0, 7)
  const categoryLegend = useMemo(() => {
    const grouped = new Map<
      string,
      { name: string; color: string; count: number; amountCents: number }
    >()
    for (const feature of data?.features ?? []) {
      const name = feature.properties.categoryName ?? 'Sem categoria'
      const current = grouped.get(name) ?? {
        name,
        color: feature.properties.categoryColor ?? fallbackCategoryColor,
        count: 0,
        amountCents: 0,
      }
      current.count += 1
      current.amountCents += feature.properties.amountCents
      grouped.set(name, current)
    }
    return [...grouped.values()]
      .sort((left, right) => right.amountCents - left.amountCents)
      .slice(0, 6)
  }, [data])

  const selectExpense = (feature: TransactionMap['features'][number]) => {
    setSelected(feature)
    setFocusCoordinates([...feature.geometry.coordinates])
  }
  const selectById = (transactionId: string) => {
    const feature = data?.features.find(
      (candidate) => candidate.properties.transactionId === transactionId,
    )
    if (feature) selectExpense(feature)
  }
  const navigateExpense = (direction: -1 | 1) => {
    if (navigableExpenses.length === 0) return
    const currentIndex = selected
      ? navigableExpenses.findIndex((feature) => feature.id === selected.id)
      : -1
    const nextIndex =
      (currentIndex + direction + navigableExpenses.length) % navigableExpenses.length
    const next = navigableExpenses[nextIndex]
    if (next) selectExpense(next)
  }
  const toggleMapStyle = () => {
    setSatellite((current) => {
      const next = !current
      try {
        localStorage.setItem(MAP_STYLE_STORAGE_KEY, next ? 'satellite' : 'map')
      } catch {
        // Storage can be unavailable in hardened or private browser contexts.
      }
      return next
    })
  }

  if (error)
    return (
      <ResourceErrorState
        compact
        title="Não foi possível carregar o mapa de gastos"
        error={error}
        fallbackMessage="Tente carregar novamente os locais desta competência."
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    )

  if (!isLoading && data?.features.length === 0)
    return (
      <div className="flex min-h-96 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <span className="bg-muted mb-3 rounded-full p-3">
          <MapPin className="text-muted-foreground size-6" />
        </span>
        <h3 className="font-heading font-semibold">Nenhum gasto localizado nesta competência</h3>
        <p className="text-muted-foreground mt-1 max-w-md text-sm">
          Novos gastos aparecem aqui automaticamente quando o dispositivo disponibiliza a
          localização.
        </p>
        {data.summary.unlocatedCount > 0 && (
          <p className="text-muted-foreground mt-3 text-xs">
            {data.summary.unlocatedCount} gasto(s) desta competência ainda não possuem local.
          </p>
        )}
      </div>
    )

  return (
    <section className="bg-background overflow-hidden rounded-xl border">
      <div className="bg-muted relative h-[min(68vh,720px)] min-h-[500px] overflow-hidden">
        <InteractiveMap
          center={[-46.6333, -23.5505]}
          zoom={10}
          loading={isLoading}
          {...(satellite && satelliteStyle
            ? { styles: { light: satelliteStyle, dark: satelliteStyle } }
            : {})}
        >
          {data && <FitMapToExpenses data={data} />}
          <FocusMapPoint coordinates={focusCoordinates} />
          <ExpenseMarkerLayer
            data={geojson}
            currency={currency}
            onSelect={selectById}
            onHover={setHoveredId}
          />
          <MapControls showZoom showCompass showLocate showFullscreen position="top-right" />
        </InteractiveMap>

        {data && (
          <aside className="bg-background/95 absolute top-4 left-4 z-10 hidden w-[320px] overflow-hidden rounded-xl border shadow-xl backdrop-blur-md md:block">
            <div className="border-b p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading font-semibold">Maiores gastos localizados</h3>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {data.summary.locatedCount} de {data.summary.transactionCount} gastos no mapa
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold">
                  {formatMoney(data.summary.locatedAmountCents, currency)}
                </p>
              </div>
              {rankedExpenses[0] && (
                <p className="text-muted-foreground mt-3 text-xs">
                  Maior gasto: {rankedExpenses[0].properties.description},{' '}
                  {formatMoney(
                    rankedExpenses[0].properties.amountCents,
                    rankedExpenses[0].properties.currency,
                  )}
                  .
                </p>
              )}
            </div>
            <ol className="max-h-[390px] overflow-y-auto py-1">
              {rankedExpenses.map((feature, index) => (
                <li key={feature.id}>
                  <button
                    type="button"
                    className={cn(
                      'hover:bg-muted/80 focus-visible:bg-muted flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors outline-none',
                      selected?.id === feature.id && 'bg-muted',
                      hoveredId === feature.properties.transactionId && 'bg-muted/70',
                    )}
                    onClick={() => selectExpense(feature)}
                    onMouseEnter={() => setHoveredId(feature.properties.transactionId)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <span className="text-muted-foreground w-4 text-center text-xs">
                      {index + 1}
                    </span>
                    {(() => {
                      const Icon = categoryIcon(feature.properties.categoryName)
                      return (
                        <span
                          className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-current/10"
                          style={{
                            color: feature.properties.categoryColor ?? fallbackCategoryColor,
                          }}
                        >
                          <Icon className="size-3.5" />
                        </span>
                      )
                    })()}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {feature.properties.description}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {feature.properties.categoryName ?? 'Sem categoria'}
                      </span>
                    </span>
                    <span className="text-sm font-semibold">
                      {formatMoney(feature.properties.amountCents, feature.properties.currency)}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        )}

        {data && (
          <div className="bg-background/95 absolute top-3 left-3 z-10 rounded-lg border px-3 py-2 shadow-lg backdrop-blur md:hidden">
            <p className="text-xs font-medium">
              {data.summary.locatedCount} de {data.summary.transactionCount} gastos no mapa
            </p>
            <p className="text-muted-foreground text-xs">
              {formatMoney(data.summary.locatedAmountCents, currency)} localizados
            </p>
          </div>
        )}

        {satelliteStyle && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="bg-background/95 absolute top-3 right-12 z-10 shadow-lg backdrop-blur"
            aria-pressed={satellite}
            onClick={toggleMapStyle}
          >
            {satellite ? <Layers3 className="size-4" /> : <Satellite className="size-4" />}
            <span className="hidden sm:inline">{satellite ? 'Mapa' : 'Satélite'}</span>
          </Button>
        )}

        {selected && (
          <article
            className="bg-background/95 absolute right-3 bottom-3 left-3 z-10 rounded-xl border p-4 shadow-xl backdrop-blur md:left-auto md:w-[330px]"
            aria-label={`Detalhes de ${selected.properties.description}`}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-2 right-2"
              aria-label="Fechar detalhes"
              onClick={() => setSelected(null)}
            >
              <X className="size-4" />
            </Button>
            <div className="pr-8">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = categoryIcon(selected.properties.categoryName)
                  return (
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-current/10"
                      style={{
                        color: selected.properties.categoryColor ?? fallbackCategoryColor,
                      }}
                    >
                      <Icon className="size-4" />
                    </span>
                  )
                })()}
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">
                    {selected.properties.categoryName ?? 'Sem categoria'} ·{' '}
                    {formatDatePtBr(selected.properties.occurredOn)}
                  </p>
                  <h3 className="font-heading truncate font-semibold">
                    {selected.properties.description}
                  </h3>
                </div>
              </div>
              <p className="mt-2 text-xl font-semibold text-red-600 dark:text-red-400">
                {formatMoney(selected.properties.amountCents, selected.properties.currency)}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                {selected.properties.accountName}
              </p>
              {navigableExpenses.length > 1 && (
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <p className="text-muted-foreground text-xs">
                    {navigableExpenses.findIndex((feature) => feature.id === selected.id) + 1} de{' '}
                    {navigableExpenses.length}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Gasto anterior"
                      onClick={() => navigateExpense(-1)}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Próximo gasto"
                      onClick={() => navigateExpense(1)}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </article>
        )}
      </div>

      {categoryLegend.length > 0 && (
        <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t px-4 py-3">
          <p className="text-muted-foreground mr-1 text-xs font-medium">Categorias</p>
          {categoryLegend.map((category) => (
            <div key={category.name} className="flex items-center gap-1.5 text-xs">
              <span className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
              <span>{category.name}</span>
              <span className="text-muted-foreground">{category.count}</span>
            </div>
          ))}
          {data && data.summary.unlocatedCount > 0 && (
            <p className="text-muted-foreground ml-auto text-xs">
              {data.summary.unlocatedCount} sem localização
            </p>
          )}
        </footer>
      )}
    </section>
  )
}
