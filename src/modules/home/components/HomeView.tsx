import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthProvider'
import { useCompetenceMonth } from '@/modules/competence/store/competence.store'
import { annualReportQuery, forecastQuery } from '@/modules/reports/queries/report.queries'
import { monthlySummaryQueryOptions } from '@/modules/transactions/queries/transaction.queries'
import { formatMoney } from '@/modules/transactions/utils/money'
import { getActiveWorkspaceUuid } from '@/modules/workspaces/lib/workspace-selection'
import { useWorkspaces } from '@/modules/workspaces/queries'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownRight, ArrowUpRight, CalendarClock, Scale } from 'lucide-react'
import { AnnualEvolutionChart, PlannedCashflowChart } from './FinancialCharts'

const monthRange = (month: string) => ({
  from: `${month}-01`,
  to: new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0))
    .toISOString()
    .slice(0, 10),
})

const monthTitle = (month: string) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(`${month}-15T12:00:00`),
  )

const MetricCard = ({
  title,
  value,
  helper,
  icon: Icon,
  tone,
}: Readonly<{
  title: string
  value: string
  helper: string
  icon: typeof ArrowUpRight
  tone?: 'positive' | 'negative'
}>) => (
  <Card size="sm">
    <CardHeader className="flex-row items-center justify-between gap-3">
      <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
      <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
        <Icon className="size-4" />
      </div>
    </CardHeader>
    <CardContent>
      <p
        className={`text-2xl font-semibold ${tone === 'positive' ? 'text-emerald-600' : tone === 'negative' ? 'text-destructive' : ''}`}
      >
        {value}
      </p>
      <p className="text-muted-foreground mt-1 text-xs">{helper}</p>
    </CardContent>
  </Card>
)

export const HomeView = () => {
  const { auth } = useAuth()
  const firstName = auth?.data?.user?.trim().split(/\s+/)[0] || 'Olá'
  const month = useCompetenceMonth()
  const range = monthRange(month)
  const summary = useQuery(monthlySummaryQueryOptions(month))
  const annual = useQuery(annualReportQuery(Number(month.slice(0, 4))))
  const forecast = useQuery(forecastQuery(range.from, range.to))
  const workspaces = useWorkspaces()
  const activeWorkspace = workspaces.data?.find(({ id }) => id === getActiveWorkspaceUuid())
  const currency = activeWorkspace?.baseCurrency ?? 'BRL'
  const data = summary.data
  const projectedNet = (data?.netCents ?? 0) + (data?.plannedNetCents ?? 0)

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div>
          <Badge variant="outline" className="mb-3 capitalize">
            {monthTitle(month)}
          </Badge>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Olá, {firstName}</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Acompanhe o desempenho financeiro da competência selecionada.
          </p>
        </div>
      </header>
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Indicadores da competência"
      >
        <MetricCard
          title="Receitas realizadas"
          value={formatMoney(data?.incomeCents ?? 0, currency)}
          helper="Confirmadas ou liquidadas"
          icon={ArrowUpRight}
          tone="positive"
        />
        <MetricCard
          title="Despesas realizadas"
          value={formatMoney(data?.expenseCents ?? 0, currency)}
          helper="Confirmadas ou liquidadas"
          icon={ArrowDownRight}
          tone="negative"
        />
        <MetricCard
          title="Resultado realizado"
          value={formatMoney(data?.netCents ?? 0, currency)}
          helper="Receitas menos despesas"
          icon={Scale}
          tone={(data?.netCents ?? 0) >= 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          title="Resultado projetado"
          value={formatMoney(projectedNet, currency)}
          helper="Realizado mais planejado"
          icon={CalendarClock}
          tone={projectedNet >= 0 ? 'positive' : 'negative'}
        />
      </section>
      <section className="grid min-w-0 gap-4 xl:grid-cols-2" aria-label="Gráficos financeiros">
        <AnnualEvolutionChart months={annual.data?.months ?? []} currency={currency} />
        <PlannedCashflowChart forecast={forecast.data} currency={currency} />
      </section>
    </div>
  )
}
