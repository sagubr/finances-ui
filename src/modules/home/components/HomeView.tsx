import { ResourceErrorState } from '@/components/ResourceErrorState'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthProvider'
import { useCompetenceMonth } from '@/modules/competence/store/competence.store'
import { monthlySummaryQueryOptions } from '@/modules/transactions/queries/transaction.queries'
import { formatMoney } from '@/modules/transactions/utils/money'
import {
  getActiveWorkspaceBaseCurrency,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { ArrowDownRight, ArrowUpRight, CalendarClock, Scale } from 'lucide-react'
import { memo, useMemo } from 'react'
import { CategorySpendingChart } from './CategorySpendingChart'
import { MonthlySpendingCalendar } from './MonthlySpendingCalendar'

const monthTitleFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
})
const monthTitle = (month: string) => monthTitleFormatter.format(new Date(`${month}-15T12:00:00`))

const MetricCard = memo(function MetricCard({
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
}>) {
  return (
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
})

export const HomeView = () => {
  const { auth } = useAuth()
  const firstName = useMemo(
    () => auth?.data?.user?.trim().split(/\s+/)[0] || 'Olá',
    [auth?.data?.user],
  )
  const month = useCompetenceMonth()
  const competenceTitle = useMemo(() => monthTitle(month), [month])
  const summary = useQuery(monthlySummaryQueryOptions(month))
  const currency = useStore(workspaceAccessStore, getActiveWorkspaceBaseCurrency)
  const data = summary.data
  const metricValues = useMemo(() => {
    if (!data || !currency) return null
    const projectedNetCents = data.netCents + data.plannedNetCents
    return {
      income: formatMoney(data.incomeCents, currency),
      expense: formatMoney(data.expenseCents, currency),
      net: formatMoney(data.netCents, currency),
      projected: formatMoney(projectedNetCents, currency),
      netTone: data.netCents >= 0 ? ('positive' as const) : ('negative' as const),
      projectedTone: projectedNetCents >= 0 ? ('positive' as const) : ('negative' as const),
    }
  }, [currency, data])

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div>
          <Badge variant="outline" className="mb-3 capitalize">
            {competenceTitle}
          </Badge>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Olá, {firstName}</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Acompanhe o desempenho financeiro da competência selecionada.
          </p>
        </div>
      </header>
      {summary.isPending || !currency ? (
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Carregando indicadores"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </section>
      ) : summary.isError ? (
        <ResourceErrorState
          compact
          title="Não foi possível carregar os indicadores"
          error={summary.error}
          fallbackMessage="Tente carregar o resumo da competência novamente."
          onRetry={() => void summary.refetch()}
          isRetrying={summary.isFetching}
        />
      ) : data && metricValues ? (
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Indicadores da competência"
        >
          <MetricCard
            title="Receitas realizadas"
            value={metricValues.income}
            helper="Confirmadas ou liquidadas"
            icon={ArrowUpRight}
            tone="positive"
          />
          <MetricCard
            title="Despesas realizadas"
            value={metricValues.expense}
            helper="Confirmadas ou liquidadas"
            icon={ArrowDownRight}
            tone="negative"
          />
          <MetricCard
            title="Resultado realizado"
            value={metricValues.net}
            helper="Receitas menos despesas"
            icon={Scale}
            tone={metricValues.netTone}
          />
          <MetricCard
            title="Resultado projetado"
            value={metricValues.projected}
            helper="Realizado mais planejado"
            icon={CalendarClock}
            tone={metricValues.projectedTone}
          />
        </section>
      ) : null}
      <section className="grid min-w-0 gap-4" aria-label="Visão financeira">
        {currency ? <CategorySpendingChart month={month} currency={currency} /> : null}
        {currency ? <MonthlySpendingCalendar month={month} currency={currency} /> : null}
      </section>
    </div>
  )
}
