import Table from '@/components/Table'
import { competenceColumn } from '@/components/Table/columns/date.columns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoney } from '@/modules/transactions/utils/money'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import type { AnnualMonth, AnnualReport } from '../models/report.types'

export const AnnualReportTable = ({
  report,
  currency,
}: Readonly<{ report: AnnualReport; currency: string }>) => {
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
      <CardContent>
        <div className="h-[480px] rounded-xl border">
          <Table<AnnualMonth>
            columns={columns}
            data={report.months}
            getRowId={(item) => item.month}
            enableRowSelection={false}
            shouldRenderCheckbox={false}
          />
        </div>
      </CardContent>
    </Card>
  )
}
