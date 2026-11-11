import {
  ResourceCollectionSkeleton,
  ResourceEmptyState,
} from '@/components/ResourceCollectionState'
import { ResourceErrorState } from '@/components/ResourceErrorState'
import { ResourceViewToolbar } from '@/components/ResourceViewToolbar'
import Table from '@/components/Table'
import { civilDateColumn } from '@/components/Table/columns/date.columns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useResourceViewMode } from '@/hooks/useResourceViewStore'
import { useCompetenceMonth } from '@/modules/competence/store/competence.store'
import { formatMoney } from '@/modules/transactions/utils/money'
import {
  getActiveWorkspaceBaseCurrency,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { formatDatePtBr } from '@/utils/date'
import { filterResources } from '@/utils/resource-search'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { AnnualReportTable } from '../components/AnnualReportTable'
import type { CashflowForecast, CategorySpending } from '../models/report.types'
import {
  annualReportQuery,
  categorySpendingQuery,
  comparisonQuery,
  forecastQuery,
} from '../queries/report.queries'

const previousMonth = (month: string) => {
  const date = new Date(`${month}-01T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() - 1)
  return date.toISOString().slice(0, 7)
}
const SummaryMetric = ({ label, value }: Readonly<{ label: string; value: string }>) => (
  <div className="bg-muted/40 rounded-lg border p-3">
    <p className="text-muted-foreground text-xs">{label}</p>
    <p className="mt-1 text-lg font-semibold">{value}</p>
  </div>
)
export type ReportSection = 'annual' | 'forecast'

export const ReportsPage = ({ section }: Readonly<{ section: ReportSection }>) => {
  const navigate = useNavigate()
  const month = useCompetenceMonth()
  const currency = useStore(workspaceAccessStore, getActiveWorkspaceBaseCurrency)
  const year = Number(month.slice(0, 4))
  const annual = useQuery({ ...annualReportQuery(year), enabled: section === 'annual' })
  const compare = useQuery({
    ...comparisonQuery(month, previousMonth(month)),
    enabled: section === 'annual',
  })
  const categorySpending = useQuery({
    ...categorySpendingQuery(month),
    enabled: section === 'annual',
  })
  const from = `${month}-01`
  const to = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0))
    .toISOString()
    .slice(0, 10)
  const forecast = useQuery({ ...forecastQuery(from, to), enabled: section === 'forecast' })
  const [annualView, setAnnualView] = useResourceViewMode('reports-annual', 'list')
  const [categoryView, setCategoryView] = useResourceViewMode('reports-categories', 'list')
  const [forecastView, setForecastView] = useResourceViewMode('reports-forecast', 'list')
  const [categorySearch, setCategorySearch] = useState('')
  const [forecastSearch, setForecastSearch] = useState('')
  const forecastColumns = useMemo<ColumnDef<CashflowForecast['items'][number]>[]>(
    () => [
      civilDateColumn<CashflowForecast['items'][number]>('date', { header: 'Data', size: 150 }),
      {
        accessorKey: 'plannedIncomeCents',
        header: 'Entradas',
        size: 180,
        cell: ({ row }) =>
          currency ? formatMoney(row.original.plannedIncomeCents, currency) : '—',
      },
      {
        accessorKey: 'plannedExpenseCents',
        header: 'Saídas',
        size: 180,
        cell: ({ row }) =>
          currency ? formatMoney(row.original.plannedExpenseCents, currency) : '—',
      },
      {
        accessorKey: 'plannedInvestmentCents',
        header: 'Aportes',
        size: 180,
        cell: ({ row }) =>
          currency ? formatMoney(row.original.plannedInvestmentCents, currency) : '—',
      },
      {
        accessorKey: 'plannedNetCents',
        header: 'Saldo',
        size: 180,
        cell: ({ row }) => (currency ? formatMoney(row.original.plannedNetCents, currency) : '—'),
      },
    ],
    [currency],
  )
  const categoryColumns = useMemo<ColumnDef<CategorySpending['items'][number]>[]>(
    () => [
      {
        accessorKey: 'categoryName',
        header: 'Categoria',
        size: 280,
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: row.original.color ?? '#64748B' }}
            />
            {row.original.categoryName}
          </span>
        ),
      },
      {
        accessorKey: 'realizedCents',
        header: 'Realizado',
        size: 170,
        cell: ({ row }) => (currency ? formatMoney(row.original.realizedCents, currency) : '—'),
      },
      {
        accessorKey: 'plannedCents',
        header: 'Previsto',
        size: 170,
        cell: ({ row }) => (currency ? formatMoney(row.original.plannedCents, currency) : '—'),
      },
      {
        accessorKey: 'totalCents',
        header: 'Total',
        size: 170,
        cell: ({ row }) => (currency ? formatMoney(row.original.totalCents, currency) : '—'),
      },
    ],
    [currency],
  )
  const filteredCategories = filterResources(categorySpending.data?.items ?? [], categorySearch)
  const filteredForecast = filterResources(forecast.data?.items ?? [], forecastSearch)

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b pb-5">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Relatórios</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Analise resultados consolidados e acompanhe o fluxo de caixa previsto.
          </p>
        </div>
      </header>
      <Tabs
        value={section}
        onValueChange={(value) =>
          void navigate({
            to: '/reports',
            search: { tab: value === 'forecast' ? 'forecast' : undefined },
          })
        }
      >
        <TabsList className="grid min-h-14 w-full grid-cols-2 p-1.5">
          <TabsTrigger value="annual" className="min-h-11 text-base">
            Relatório anual
          </TabsTrigger>
          <TabsTrigger value="forecast" className="min-h-11 text-base">
            Fluxo de caixa
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {section === 'annual' && (
        <Card>
          <CardHeader>
            <CardTitle>Comparativo mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {compare.isPending || !currency ? (
              <ResourceCollectionSkeleton viewMode="list" rows={2} className="h-auto" />
            ) : compare.isError ? (
              <ResourceErrorState
                compact
                title="Não foi possível carregar o comparativo"
                error={compare.error}
                fallbackMessage="Tente carregar o comparativo novamente."
                onRetry={() => void compare.refetch()}
                isRetrying={compare.isFetching}
              />
            ) : compare.data ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Atual</p>
                  <p className="text-lg font-semibold">
                    {formatMoney(
                      compare.data.current.incomeCents - compare.data.current.expenseCents,
                      currency,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Anterior</p>
                  <p className="text-lg font-semibold">
                    {formatMoney(
                      compare.data.previous.incomeCents - compare.data.previous.expenseCents,
                      currency,
                    )}
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
      {section === 'annual' && (annual.isPending || !currency) && (
        <ResourceCollectionSkeleton viewMode={annualView} rows={12} />
      )}
      {section === 'annual' && annual.isError && (
        <ResourceErrorState
          title="Não foi possível carregar o relatório anual"
          error={annual.error}
          fallbackMessage="Tente carregar o relatório novamente."
          onRetry={() => void annual.refetch()}
          isRetrying={annual.isFetching}
        />
      )}
      {section === 'annual' && annual.data && currency && (
        <AnnualReportTable
          report={annual.data}
          currency={currency}
          viewMode={annualView}
          onViewModeChange={setAnnualView}
        />
      )}
      {section === 'annual' && (
        <Card>
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResourceViewToolbar
              count={filteredCategories.length}
              label="categorias"
              viewMode={categoryView}
              onViewModeChange={setCategoryView}
              search={{
                value: categorySearch,
                onValueChange: setCategorySearch,
                placeholder: 'Buscar categoria',
              }}
            />
            {categorySpending.data && currency && (
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryMetric
                  label="Realizado"
                  value={formatMoney(categorySpending.data.totals.realizedCents, currency)}
                />
                <SummaryMetric
                  label="Previsto"
                  value={formatMoney(categorySpending.data.totals.plannedCents, currency)}
                />
                <SummaryMetric
                  label="Total da competência"
                  value={formatMoney(categorySpending.data.totals.totalCents, currency)}
                />
              </div>
            )}
            {categorySpending.isPending || !currency ? (
              <ResourceCollectionSkeleton viewMode={categoryView} rows={5} className="h-[360px]" />
            ) : categorySpending.isError ? (
              <ResourceErrorState
                compact
                title="Não foi possível carregar os gastos por categoria"
                error={categorySpending.error}
                fallbackMessage="Tente carregar os gastos novamente."
                onRetry={() => void categorySpending.refetch()}
                isRetrying={categorySpending.isFetching}
              />
            ) : categorySpending.data.items.length === 0 ? (
              <ResourceEmptyState
                title="Nenhum gasto nesta competência"
                description="Os gastos realizados e planejados aparecerão aqui quando houver lançamentos."
              />
            ) : categoryView === 'list' ? (
              <div className="h-[360px] rounded-xl border">
                <Table
                  columns={categoryColumns}
                  data={filteredCategories}
                  getRowId={(item) => item.categoryId}
                  enableRowSelection={false}
                  shouldRenderCheckbox={false}
                />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCategories.map((item) => (
                  <Card key={item.categoryId} size="sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color ?? '#64748B' }}
                        />
                        {item.categoryName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Realizado</span>
                        <span className="font-medium">
                          {formatMoney(item.realizedCents, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Previsto</span>
                        <span className="font-medium">
                          {formatMoney(item.plannedCents, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3 border-t pt-2">
                        <span className="font-medium">Total</span>
                        <strong>{formatMoney(item.totalCents, currency)}</strong>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {section === 'forecast' && (
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de caixa previsto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResourceViewToolbar
              count={filteredForecast.length}
              label="dias projetados"
              viewMode={forecastView}
              onViewModeChange={setForecastView}
              search={{
                value: forecastSearch,
                onValueChange: setForecastSearch,
                placeholder: 'Buscar dia projetado',
              }}
            />
            {forecast.data && currency && (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryMetric
                  label="Entradas previstas"
                  value={formatMoney(forecast.data.totals.plannedIncomeCents, currency)}
                />
                <SummaryMetric
                  label="Gastos previstos"
                  value={formatMoney(forecast.data.totals.plannedExpenseCents, currency)}
                />
                <SummaryMetric
                  label="Aportes previstos"
                  value={formatMoney(forecast.data.totals.plannedInvestmentCents, currency)}
                />
                <SummaryMetric
                  label="Caixa projetado"
                  value={formatMoney(forecast.data.totals.plannedNetCents, currency)}
                />
              </div>
            )}
            {forecast.isPending || !currency ? (
              <ResourceCollectionSkeleton viewMode={forecastView} rows={6} className="h-[420px]" />
            ) : forecast.isError ? (
              <ResourceErrorState
                compact
                title="Não foi possível carregar a previsão"
                error={forecast.error}
                fallbackMessage="Tente carregar a previsão novamente."
                onRetry={() => void forecast.refetch()}
                isRetrying={forecast.isFetching}
              />
            ) : forecast.data.items.length === 0 ? (
              <ResourceEmptyState
                title="Nenhum lançamento previsto"
                description="Cadastre lançamentos ou aportes planejados para visualizar a projeção da competência."
              />
            ) : forecastView === 'list' ? (
              <div className="h-[420px] rounded-xl border">
                <Table
                  columns={forecastColumns}
                  data={filteredForecast}
                  getRowId={(item) => item.date}
                  enableRowSelection={false}
                  shouldRenderCheckbox={false}
                />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredForecast.map((item) => (
                  <Card key={item.date} size="sm">
                    <CardHeader>
                      <CardTitle className="text-base">{formatDatePtBr(item.date)}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Entradas</span>
                        <span className="font-medium">
                          {formatMoney(item.plannedIncomeCents, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Saídas</span>
                        <span className="font-medium">
                          {formatMoney(item.plannedExpenseCents, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Aportes</span>
                        <span className="font-medium">
                          {formatMoney(item.plannedInvestmentCents, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3 border-t pt-2">
                        <span className="font-medium">Saldo</span>
                        <strong
                          className={
                            item.plannedNetCents < 0 ? 'text-destructive' : 'text-emerald-600'
                          }
                        >
                          {formatMoney(item.plannedNetCents, currency)}
                        </strong>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
