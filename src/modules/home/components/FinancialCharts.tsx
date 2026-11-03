import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AnnualMonth, CashflowForecast } from '@/modules/reports/models/report.types'
import { formatMoney } from '@/modules/transactions/utils/money'
import { useMemo } from 'react'

type ChartPoint = Readonly<{ label: string; incomeCents: number; expenseCents: number }>

const barHeight = (value: number, maximum: number) =>
  value === 0 ? '0%' : `${Math.max(2, (value / maximum) * 100)}%`

const monthLabel = (month: string) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'short' })
    .format(new Date(`${month}-15T12:00:00`))
    .replace('.', '')

const BarChart = ({
  points,
  currency,
  emptyMessage,
}: Readonly<{ points: readonly ChartPoint[]; currency: string; emptyMessage: string }>) => {
  const maximum = Math.max(
    0,
    ...points.flatMap(({ incomeCents, expenseCents }) => [incomeCents, expenseCents]),
  )
  if (maximum === 0)
    return (
      <p className="text-muted-foreground flex min-h-52 items-center justify-center text-sm">
        {emptyMessage}
      </p>
    )

  return (
    <div className="space-y-4">
      <div
        className="flex h-52 items-end gap-2 border-b px-1"
        role="img"
        aria-label="Gráfico de receitas e despesas"
      >
        {points.map((point) => (
          <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end justify-center gap-1">
              <div
                className="w-full max-w-4 rounded-t bg-emerald-500/80 transition-[height]"
                style={{ height: barHeight(point.incomeCents, maximum) }}
                title={`Receitas: ${formatMoney(point.incomeCents, currency)}`}
              />
              <div
                className="bg-destructive/75 w-full max-w-4 rounded-t transition-[height]"
                style={{ height: barHeight(point.expenseCents, maximum) }}
                title={`Despesas: ${formatMoney(point.expenseCents, currency)}`}
              />
            </div>
            <span className="text-muted-foreground truncate text-[10px] capitalize">
              {point.label}
            </span>
          </div>
        ))}
      </div>
      <div className="text-muted-foreground flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-emerald-500/80" />
          Receitas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-destructive/75 size-2.5 rounded-sm" />
          Despesas
        </span>
      </div>
    </div>
  )
}

export const AnnualEvolutionChart = ({
  months,
  currency,
}: Readonly<{ months: readonly AnnualMonth[]; currency: string }>) => {
  const points = useMemo(
    () =>
      months.map((month) => ({
        label: monthLabel(month.month),
        incomeCents: month.incomeCents,
        expenseCents: month.expenseCents,
      })),
    [months],
  )
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução no ano</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart
          points={points}
          currency={currency}
          emptyMessage="Ainda não há movimentações neste ano."
        />
      </CardContent>
    </Card>
  )
}

export const PlannedCashflowChart = ({
  forecast,
  currency,
}: Readonly<{ forecast: CashflowForecast | undefined; currency: string }>) => {
  const points = useMemo(
    () =>
      (forecast?.items ?? []).map((item) => ({
        label: item.date.slice(8, 10),
        incomeCents: item.plannedIncomeCents,
        expenseCents: item.plannedExpenseCents,
      })),
    [forecast],
  )
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo planejado na competência</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart
          points={points}
          currency={currency}
          emptyMessage="Nenhum lançamento planejado nesta competência."
        />
      </CardContent>
    </Card>
  )
}
