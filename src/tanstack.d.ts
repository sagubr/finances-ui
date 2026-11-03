import '@tanstack/react-table'
import type { ColumnDef, Header, Row, RowData } from '@tanstack/react-table'
import type { ClassValue } from 'clsx'
import type React from 'react'
import type { ZodSchema } from 'zod'

export type UpdateData<TData> = (
  id: string | number,
  columnId: keyof TData,
  value: any,
  columnDef: ColumnDef<TData, any>,
) => void

type ValidatorProps<TData> = {
  value: string | number
}

type ValidatorFn = (props: ValidatorProps<any>) => ZodSchema

type FormatterProps<TData> = {
  row: Row<TData>
  value: string
}

export type FormatterFn<T> = (props: FormatterProps<T>) => string

type RenderMenuItemProps = {
  header: Header<any, any>
}

export type ColumnFilterType = 'select' | 'input'

export type RenderMenuItemFn = (props: RenderMenuItemProps) => React.ReactNode

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    enableMenu?: boolean
    enableColumnOrdering?: boolean
    enableColumnEditable?: boolean
    editableColumnType?: 'text' | 'number'
    editableColumnProps?: React.InputHTMLAttributes<HTMLInputElement>
    header?: {
      className?: ClassValue
      menu?: {
        renderMenuItem?: RenderMenuItemFn
        className?: ClassValue
      }
      columnFilterType?: ColumnFilterType
    }
    excel?: {
      exportToExcel?: boolean
      excelHeader?: string
      formatter?: FormatterFn<TData>
    }
    cell?: {
      className?: ClassValue | ((props: any) => ClassValue)
      formatterFn?: FormatterFn<TData>
      validator?: ZodSchema
    }
    row?: {
      isGrouped?: boolean
    }
  }
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    tableId?: string | number
    layout?: 'stretch' | 'default'
    row?: {
      className?: ClassValue
      disableAnimation?: boolean
    }
    header?: {
      className?: ClassValue
    }
    cell?: {
      className?: ClassValue
      validatorErrorClassName?: string
      validatorSuccessClassName?: string
    }
    excel?: {
      sheetName?: string
    }
    updateData?: UpdateData<TData>
  }
}
