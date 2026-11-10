import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipPanel, TooltipTrigger } from '@/components/ui/tooltip'
import type { AnnualMonth, CashflowForecast } from '@/modules/reports/models/report.types'
import { formatMoney } from '@/modules/transactions/utils/money'
import { memo, useMemo } from 'react'

export type ChartPoint = Readonly<{
  key: string
  label: string
  incomeCents: number
  expenseCents: number
}>

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
const minimumChartWidth = (pointCount: number) => Math.max(280, pointCount * 42)
const barHeight = (value: number, maximum: number) =>
  value <= 0 ? '0%' : `${Math.max(2, (value / maximum) * 100)}%`

export const linearTrend = (values: readonly number[]): readonly number[] => {
  if (values.length < 2) return values
  const xMean = (values.length - 1) / 2
  const yMean = values.reduce((sum, value) => sum + value, 0) / values.length
  const denominator = values.reduce((sum, _, index) => sum + (index - xMean) ** 2, 0)
  const slope =
    denominator === 0
      ? 0
      : values.reduce((sum, value, index) => sum + (index - xMean) * (value - yMean), 0) /
        denominator
  const intercept = yMean - slope * xMean
  return values.map((_, index) => Math.max(0, intercept + slope * index))
}

const monthLabel = (month: string) =>
  monthFormatter.format(new Date(`${month}-15T12:00:00`)).replace('.', '')

export const groupForecastByWeek = (forecast: CashflowForecast): readonly ChartPoint[] => {
  const finalDay = Number(forecast.to.slice(8, 10))
  const groups = new Map<number, { incomeCents: number; expenseCents: number }>()

  for (const item of forecast.items) {
    const day = Number(item.date.slice(8, 10))
    const startDay = Math.floor((day - 1) / 7) * 7 + 1
    const group = groups.get(startDay) ?? { incomeCents: 0, expenseCents: 0 }
    group.incomeCents += item.plannedIncomeCents
    group.expenseCents += item.plannedExpenseCents
    groups.set(startDay, group)
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => left - right)
    .map(([startDay, values]) => ({
      key: `week-${startDay}`,
      label: `${startDay}–${Math.min(startDay + 6, finalDay)}`,
      ...values,
    }))
}

const BarChart = memo(function BarChart({
  points,
  currency,
  emptyMessage,
  showExpenseTrend = false,
  trendPointCount = points.length,
}: Readonly<{
  points: readonly ChartPoint[]
  currency: string
  emptyMessage: string
  showExpenseTrend?: boolean
  trendPointCount?: number
}>) {
  const chart = useMemo(() => {
    const maximum = Math.max(
      0,
      ...points.flatMap(({ incomeCents, expenseCents }) => [incomeCents, expenseCents]),
    )
    const renderedPoints = points.map((point) => {
      const incomeLabel = formatMoney(point.incomeCents, currency)
      const expenseLabel = formatMoney(point.expenseCents, currency)
      const resultCents = point.incomeCents - point.expenseCents
      return {
        ...point,
        incomeLabel,
        expenseLabel,
        resultLabel: formatMoney(resultCents, currency),
        incomeStyle: { height: barHeight(point.incomeCents, maximum) },
        expenseStyle: { height: barHeight(point.expenseCents, maximum) },
        ariaLabel: `${point.label}: receitas ${incomeLabel}; despesas ${expenseLabel}`,
      }
    })
    const trendSource = points.slice(0, trendPointCount)
    const expenseTrend =
      trendSource.length < 2 ? [] : linearTrend(trendSource.map((point) => point.expenseCents))
    const trendPoints = expenseTrend
      .map((value, index) => {
        const x = (index + 0.5) * 100
        const y = maximum === 0 ? 100 : 100 - Math.min(100, (value / maximum) * 100)
        return `${x},${y}`
      })
      .join(' ')
    return {
      maximum,
      renderedPoints,
      trendPoints,
      trendViewBox: `0 0 ${points.length * 100} 100`,
      minimumWidthStyle: { minWidth: `${minimumChartWidth(points.length)}px` },
    }
  }, [currency, points, trendPointCount])

  if (chart.maximum === 0)
    return (
      <p className="text-muted-foreground flex min-h-56 items-center justify-center px-4 text-center text-sm">
        {emptyMessage}
      </p>
    )

  return (
    <div className="min-w-0 space-y-3">
      <div
        className="[scrollbar-width:thin] overflow-x-auto overscroll-x-contain pb-1"
        role="group"
        aria-label="Gráfico de receitas e despesas"
      >
        <div className="relative h-56 w-full border-b px-1" style={chart.minimumWidthStyle}>
          <div className="absolute inset-0 flex items-end gap-2 px-1">
            {chart.renderedPoints.map((point) => (
              <Tooltip key={point.key}>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="focus-visible:ring-ring/50 flex h-full min-w-0 flex-1 flex-col items-center gap-2 rounded-md outline-none focus-visible:ring-3"
                      aria-label={point.ariaLabel}
                    />
                  }
                >
                  <span
                    className="flex h-48 w-full items-end justify-center gap-1"
                    aria-hidden="true"
                  >
                    <span
                      className="w-full max-w-4 rounded-t-md bg-emerald-500/80 transition-[height] motion-reduce:transition-none"
                      style={point.incomeStyle}
                    />
                    <span
                      className="bg-destructive/75 w-full max-w-4 rounded-t-md transition-[height] motion-reduce:transition-none"
                      style={point.expenseStyle}
                    />
                  </span>
                  <span className="text-muted-foreground w-full truncate text-center text-xs capitalize">
                    {point.label}
                  </span>
                </TooltipTrigger>
                <TooltipPanel
                  side="top"
                  className="border-border bg-popover text-popover-foreground min-w-44 border px-3 py-2 shadow-lg"
                >
                  <p className="mb-1.5 font-medium capitalize">{point.label}</p>
                  <p className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Receitas</span>
                    <span>{point.incomeLabel}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Despesas</span>
                    <span>{point.expenseLabel}</span>
                  </p>
                  <p className="mt-1 flex justify-between gap-4 border-t pt-1 font-medium">
                    <span>Resultado</span>
                    <span>{point.resultLabel}</span>
                  </p>
                </TooltipPanel>
              </Tooltip>
            ))}
          </div>
          {showExpenseTrend && chart.trendPoints && (
            <svg
              className="pointer-events-none absolute top-0 right-1 left-1 h-48 overflow-visible"
              viewBox={chart.trendViewBox}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polyline
                points={chart.trendPoints}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                strokeDasharray="5 4"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
        </div>
      </div>
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-emerald-500/80" />
          Receitas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-destructive/75 size-2.5 rounded-sm" />
          Despesas
        </span>
        {showExpenseTrend && (
          <span className="flex items-center gap-1.5">
            <span className="border-primary w-4 border-t-2 border-dashed" />
            Tendência das despesas
          </span>
        )}
      </div>
    </div>
  )
})

export const AnnualEvolutionChart = memo(function AnnualEvolutionChart({
  months,
  currency,
  throughMonth,
}: Readonly<{ months: readonly AnnualMonth[]; currency: string; throughMonth?: string }>) {
  const points = useMemo<readonly ChartPoint[]>(
    () =>
      months.map((month) => ({
        key: month.month,
        label: monthLabel(month.month),
        incomeCents: month.incomeCents,
        expenseCents: month.expenseCents,
      })),
    [months],
  )
  const trendPointCount = useMemo(() => {
    if (!throughMonth || !months[0] || !throughMonth.startsWith(months[0].month.slice(0, 4)))
      return months.length
    return Number(throughMonth.slice(5, 7))
  }, [months, throughMonth])
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Evolução no ano</CardTitle>
        <CardDescription>
          Receitas, despesas e tendência dos gastos realizados por mês.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <BarChart
          points={points}
          currency={currency}
          emptyMessage="Ainda não há movimentações neste ano."
          showExpenseTrend
          trendPointCount={trendPointCount}
        />
      </CardContent>
    </Card>
  )
})

export const PlannedCashflowChart = memo(function PlannedCashflowChart({
  forecast,
  currency,
}: Readonly<{ forecast: CashflowForecast | undefined; currency: string }>) {
  const points = useMemo<readonly ChartPoint[]>(
    () => (forecast ? groupForecastByWeek(forecast) : []),
    [forecast],
  )
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Fluxo planejado na competência</CardTitle>
        <CardDescription>Valores previstos agrupados por semana do mês.</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <BarChart
          points={points}
          currency={currency}
          emptyMessage="Nenhum lançamento planejado nesta competência."
        />
      </CardContent>
    </Card>
  )
})
