import Table from '@/components/Table'
import { civilDateColumn } from '@/components/Table/columns/date.columns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDomainLabel } from '@/lib/domain-labels'
import { useCompetenceMonth } from '@/modules/competence/store/competence.store'
import { formatMoney } from '@/modules/transactions/utils/money'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { AnnualReportTable } from '../components/AnnualReportTable'
import type { CashflowForecast, CategorySpending } from '../models/report.types'
import {
  annualReportQuery,
  categorySpendingQuery,
  comparisonQuery,
  forecastQuery,
  useCreateExport,
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
export type ReportSection = 'annual' | 'forecast' | 'exports'

const sectionContent: Record<ReportSection, Readonly<{ title: string; description: string }>> = {
  annual: {
    title: 'Relatório anual',
    description: 'Consolidação do ano e comparação da competência atual com o mês anterior.',
  },
  forecast: {
    title: 'Fluxo de caixa previsto',
    description: 'Acompanhe entradas, saídas e saldo planejado para a competência.',
  },
  exports: {
    title: 'Exportações',
    description: 'Gere arquivos assíncronos com seus dados financeiros consolidados.',
  },
}

export const ReportsPage = ({ section }: Readonly<{ section: ReportSection }>) => {
  const month = useCompetenceMonth()
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
  const createExport = useCreateExport()
  const forecastColumns = useMemo<ColumnDef<CashflowForecast['items'][number]>[]>(
    () => [
      civilDateColumn<CashflowForecast['items'][number]>('date', { header: 'Data', size: 150 }),
      {
        accessorKey: 'plannedIncomeCents',
        header: 'Entradas',
        size: 180,
        cell: ({ row }) => formatMoney(row.original.plannedIncomeCents, 'BRL'),
      },
      {
        accessorKey: 'plannedExpenseCents',
        header: 'Saídas',
        size: 180,
        cell: ({ row }) => formatMoney(row.original.plannedExpenseCents, 'BRL'),
      },
      {
        accessorKey: 'plannedInvestmentCents',
        header: 'Aportes',
        size: 180,
        cell: ({ row }) => formatMoney(row.original.plannedInvestmentCents, 'BRL'),
      },
      {
        accessorKey: 'plannedNetCents',
        header: 'Saldo',
        size: 180,
        cell: ({ row }) => formatMoney(row.original.plannedNetCents, 'BRL'),
      },
    ],
    [],
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
        cell: ({ row }) => formatMoney(row.original.realizedCents, 'BRL'),
      },
      {
        accessorKey: 'plannedCents',
        header: 'Previsto',
        size: 170,
        cell: ({ row }) => formatMoney(row.original.plannedCents, 'BRL'),
      },
      {
        accessorKey: 'totalCents',
        header: 'Total',
        size: 170,
        cell: ({ row }) => formatMoney(row.original.totalCents, 'BRL'),
      },
    ],
    [],
  )
  return (
    <div className="flex flex-col gap-6">
      <header className="border-b pb-5">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{sectionContent[section].title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {sectionContent[section].description}
          </p>
        </div>
      </header>
      {section === 'annual' && (
        <Card>
          <CardHeader>
            <CardTitle>Comparativo mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {compare.data ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Atual</p>
                  <p className="text-lg font-semibold">
                    {formatMoney(
                      compare.data.current.incomeCents - compare.data.current.expenseCents,
                      'BRL',
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Anterior</p>
                  <p className="text-lg font-semibold">
                    {formatMoney(
                      compare.data.previous.incomeCents - compare.data.previous.expenseCents,
                      'BRL',
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Carregando…</p>
            )}
          </CardContent>
        </Card>
      )}
      {section === 'annual' && annual.data && <AnnualReportTable report={annual.data} />}
      {section === 'annual' && (
        <Card>
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryMetric
                label="Realizado"
                value={formatMoney(categorySpending.data?.totals.realizedCents ?? 0, 'BRL')}
              />
              <SummaryMetric
                label="Previsto"
                value={formatMoney(categorySpending.data?.totals.plannedCents ?? 0, 'BRL')}
              />
              <SummaryMetric
                label="Total da competência"
                value={formatMoney(categorySpending.data?.totals.totalCents ?? 0, 'BRL')}
              />
            </div>
            <div className="h-[360px] rounded-xl border">
              <Table
                columns={categoryColumns}
                data={categorySpending.data?.items ?? []}
                getRowId={(item) => item.categoryId}
                enableRowSelection={false}
                shouldRenderCheckbox={false}
              />
            </div>
          </CardContent>
        </Card>
      )}
      {section === 'exports' && (
        <Card>
          <CardHeader>
            <CardTitle>Exportação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Gere um arquivo assíncrono com os dados consolidados.
            </p>
            <Button
              disabled={createExport.isPending}
              onClick={() => createExport.mutate({ report: 'ANNUAL', format: 'CSV' })}
            >
              Exportar CSV anual
            </Button>
            {createExport.data && (
              <p className="text-sm">
                Solicitação {createExport.data.id}: {getDomainLabel(createExport.data.status)}
              </p>
            )}
          </CardContent>
        </Card>
      )}
      {section === 'forecast' && (
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de caixa previsto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric
                label="Entradas previstas"
                value={formatMoney(forecast.data?.totals.plannedIncomeCents ?? 0, 'BRL')}
              />
              <SummaryMetric
                label="Gastos previstos"
                value={formatMoney(forecast.data?.totals.plannedExpenseCents ?? 0, 'BRL')}
              />
              <SummaryMetric
                label="Aportes previstos"
                value={formatMoney(forecast.data?.totals.plannedInvestmentCents ?? 0, 'BRL')}
              />
              <SummaryMetric
                label="Caixa projetado"
                value={formatMoney(forecast.data?.totals.plannedNetCents ?? 0, 'BRL')}
              />
            </div>
            <div className="h-[420px] rounded-xl border">
              <Table
                columns={forecastColumns}
                data={forecast.data?.items ?? []}
                getRowId={(item) => item.date}
                enableRowSelection={false}
                shouldRenderCheckbox={false}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
