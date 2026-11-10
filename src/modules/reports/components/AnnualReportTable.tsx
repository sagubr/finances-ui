import { ResourceViewToolbar } from '@/components/ResourceViewToolbar'
import Table from '@/components/Table'
import { competenceColumn } from '@/components/Table/columns/date.columns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ViewMode } from '@/components/ViewModeToggle'
import { formatMoney } from '@/modules/transactions/utils/money'
import { formatCompetencePtBr } from '@/utils/date'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import type { AnnualMonth, AnnualReport } from '../models/report.types'

export const AnnualReportTable = ({
  report,
  currency,
  viewMode,
  onViewModeChange,
}: Readonly<{
  report: AnnualReport
  currency: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}>) => {
  const columns = useMemo<ColumnDef<AnnualMonth>[]>(
    () => [
      competenceColumn<AnnualMonth>('month', { header: 'Mês', size: 140 }),
      {
        accessorKey: 'incomeCents',
        header: 'Receitas',
        size: 180,
        cell: ({ row }) => formatMoney(row.original.incomeCents, currency),
      },
      {
        accessorKey: 'expenseCents',
        header: 'Despesas',
        size: 180,
        cell: ({ row }) => formatMoney(row.original.expenseCents, currency),
      },
      {
        accessorKey: 'netCents',
        header: 'Resultado',
        size: 180,
        cell: ({ row }) => (
          <span className={row.original.netCents < 0 ? 'text-destructive' : 'text-emerald-600'}>
            {formatMoney(row.original.netCents, currency)}
          </span>
        ),
      },
    ],
    [currency],
  )
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultado anual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResourceViewToolbar
          count={report.months.length}
          label="meses"
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
        {viewMode === 'list' ? (
          <div className="h-[480px] rounded-xl border">
            <Table<AnnualMonth>
              columns={columns}
              data={report.months}
              getRowId={(item) => item.month}
              enableRowSelection={false}
              shouldRenderCheckbox={false}
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {report.months.map((item) => (
              <Card key={item.month} size="sm">
                <CardHeader>
                  <CardTitle className="text-base capitalize">
                    {formatCompetencePtBr(item.month)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Receitas</span>
                    <span className="font-medium">{formatMoney(item.incomeCents, currency)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Despesas</span>
                    <span className="font-medium">{formatMoney(item.expenseCents, currency)}</span>
                  </div>
                  <div className="flex justify-between gap-3 border-t pt-2">
                    <span className="font-medium">Resultado</span>
                    <strong className={item.netCents < 0 ? 'text-destructive' : 'text-emerald-600'}>
                      {formatMoney(item.netCents, currency)}
                    </strong>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
