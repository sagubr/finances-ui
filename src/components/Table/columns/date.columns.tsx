import { formatCompetencePtBr, formatDatePtBr, formatDateTimePtBr } from '@/utils/date'
import type { ColumnDef } from '@tanstack/react-table'

type DateKey<T> = Extract<keyof T, string>
type DateColumnOptions = Readonly<{ header: string; size?: number }>

const formattedColumn = <T extends object>(
  accessorKey: DateKey<T>,
  options: DateColumnOptions,
  formatter: (value: string | null | undefined) => string,
): ColumnDef<T> =>
  ({
    accessorKey,
    header: options.header,
    size: options.size ?? 160,
    cell: ({ row }) => formatter(row.original[accessorKey] as string | null | undefined),
  }) as ColumnDef<T>

export const civilDateColumn = <T extends object>(
  accessorKey: DateKey<T>,
  options: DateColumnOptions,
) => formattedColumn(accessorKey, options, formatDatePtBr)

export const dateTimeColumn = <T extends object>(
  accessorKey: DateKey<T>,
  options: DateColumnOptions,
) => formattedColumn(accessorKey, options, formatDateTimePtBr)

export const competenceColumn = <T extends object>(
  accessorKey: DateKey<T>,
  options: DateColumnOptions,
) => formattedColumn(accessorKey, options, formatCompetencePtBr)
