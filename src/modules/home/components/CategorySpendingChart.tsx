import { ResourceErrorState } from '@/components/ResourceErrorState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipPanel, TooltipTrigger } from '@/components/ui/tooltip'
import type { CategorySpending } from '@/modules/reports/models/report.types'
import { categorySpendingQuery } from '@/modules/reports/queries/report.queries'
import { formatMoney } from '@/modules/transactions/utils/money'
import { useQuery } from '@tanstack/react-query'
import { memo, useMemo, useState } from 'react'
import { SpendingDetailsDrawer } from './SpendingDetailsDrawer'

const fallbackColors = [
  '#0f766e',
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#ca8a04',
  '#4f46e5',
  '#0891b2',
] as const
const compactNumber = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

type CategoryItem = CategorySpending['items'][number]
type PieSlice = CategoryItem & {
  colorValue: string
  percentage: number
  dashArray: string
  dashOffset: number
  valueLabel: string
}

export const buildCategorySlices = (
  items: readonly CategoryItem[],
  currency: string,
): readonly PieSlice[] => {
  const visibleItems = items.filter((item) => item.totalCents > 0)
  const total = visibleItems.reduce((sum, item) => sum + item.totalCents, 0)
  let offset = 0

  return visibleItems.map((item, index) => {
    const percentage = total === 0 ? 0 : (item.totalCents / total) * 100
    const slice = {
      ...item,
      colorValue: item.color ?? fallbackColors[index % fallbackColors.length],
      percentage,
      dashArray: `${percentage} ${100 - percentage}`,
      dashOffset: -offset,
      valueLabel: formatMoney(item.totalCents, currency),
    }
    offset += percentage
    return slice
  })
}

export const CategorySpendingChart = memo(function CategorySpendingChart({
  month,
  currency,
}: Readonly<{ month: string; currency: string }>) {
  const spending = useQuery(categorySpendingQuery(month))
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null)
  const slices = useMemo(
    () => buildCategorySlices(spending.data?.items ?? [], currency),
    [currency, spending.data?.items],
  )
  const totalLabel = useMemo(
    () => compactNumber.format((spending.data?.totals.totalCents ?? 0) / 100),
    [spending.data?.totals.totalCents],
  )
  const drawerDescription = selectedCategory
    ? `${formatMoney(selectedCategory.realizedCents, currency)} realizados e ${formatMoney(selectedCategory.plannedCents, currency)} planejados.`
    : ''

  return (
    <>
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Gastos por categoria</CardTitle>
          <CardDescription>
            Distribuição do realizado e planejado na competência. Selecione uma categoria para ver
            os lançamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          {spending.isPending ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="mx-auto aspect-square w-full max-w-72 rounded-full" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : spending.isError ? (
            <ResourceErrorState
              compact
              title="Não foi possível carregar as categorias"
              error={spending.error}
              fallbackMessage="Tente carregar a distribuição de gastos novamente."
              onRetry={() => void spending.refetch()}
              isRetrying={spending.isFetching}
            />
          ) : slices.length === 0 ? (
            <p className="text-muted-foreground flex min-h-48 items-center justify-center text-center text-sm">
              Ainda não há gastos categorizados nesta competência.
            </p>
          ) : (
            <div className="grid items-center gap-6 lg:grid-cols-[minmax(17rem,0.8fr)_minmax(0,1.2fr)]">
              <div className="mx-auto aspect-square w-full max-w-72">
                <svg
                  viewBox="0 0 100 100"
                  className="size-full -rotate-90 overflow-visible"
                  role="group"
                  aria-label="Distribuição dos gastos por categoria"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="20"
                    className="text-muted"
                  />
                  {slices.map((slice) => (
                    <Tooltip key={slice.categoryId}>
                      <TooltipTrigger
                        render={
                          <circle
                            cx="50"
                            cy="50"
                            r="34"
                            pathLength="100"
                            fill="none"
                            stroke={slice.colorValue}
                            strokeWidth="20"
                            strokeDasharray={slice.dashArray}
                            strokeDashoffset={slice.dashOffset}
                            className="cursor-pointer transition-[stroke-width,opacity] outline-none hover:opacity-85 focus-visible:stroke-[23px]"
                            role="button"
                            tabIndex={0}
                            aria-label={`${slice.categoryName}: ${slice.valueLabel}, ${slice.percentage.toFixed(1)}%`}
                            onClick={() => setSelectedCategory(slice)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                setSelectedCategory(slice)
                              }
                            }}
                          />
                        }
                      />
                      <TooltipPanel
                        side="top"
                        className="border-border bg-popover text-popover-foreground min-w-48 border px-3 py-2 shadow-lg"
                      >
                        <p className="mb-1.5 font-medium">{slice.categoryName}</p>
                        <p className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Realizado</span>
                          <span>{formatMoney(slice.realizedCents, currency)}</span>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Planejado</span>
                          <span>{formatMoney(slice.plannedCents, currency)}</span>
                        </p>
                        <p className="mt-1 flex justify-between gap-4 border-t pt-1 font-medium">
                          <span>Total</span>
                          <span>{slice.valueLabel}</span>
                        </p>
                      </TooltipPanel>
                    </Tooltip>
                  ))}
                  <g className="text-foreground" transform="rotate(90 50 50)">
                    <text
                      x="50"
                      y="47"
                      textAnchor="middle"
                      className="fill-muted-foreground text-[6px]"
                    >
                      Total
                    </text>
                    <text
                      x="50"
                      y="57"
                      textAnchor="middle"
                      className="fill-foreground text-[8px] font-semibold"
                    >
                      {totalLabel}
                    </text>
                  </g>
                </svg>
              </div>
              <ul className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {slices.map((slice) => (
                  <li key={slice.categoryId}>
                    <button
                      type="button"
                      className="hover:bg-muted focus-visible:ring-ring/50 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left outline-none focus-visible:ring-3"
                      onClick={() => setSelectedCategory(slice)}
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: slice.colorValue }}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">{slice.categoryName}</span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {slice.percentage.toFixed(1)}%
                      </span>
                      <span className="text-sm font-medium tabular-nums">{slice.valueLabel}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      <SpendingDetailsDrawer
        open={selectedCategory !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedCategory(null)
        }}
        month={month}
        currency={currency}
        title={selectedCategory?.categoryName ?? ''}
        description={drawerDescription}
        filters={selectedCategory ? { categoryId: selectedCategory.categoryId } : {}}
      />
    </>
  )
})
