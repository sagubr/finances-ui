import { Tooltip, TooltipPanel, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Cell } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { ChevronDown, ChevronRight, CornerDownRight } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTableContext } from '../../hooks/useTableContext'
import { getCommonPinningStyles } from '../../utils'

type CellProps<TData> = {
  cell: Cell<TData, any>
  className?: string
}

const TableCell = <T,>({ cell, ...props }: CellProps<T>) => {
  const { table } = useTableContext<T>()

  if (!table) return null

  return <TableCellRenderer cell={cell} {...props} />
}

type ExpandedContainerProps = {
  children: ReactNode
  className?: string
}

const ExpandedContainer = ({ children, className }: ExpandedContainerProps) => {
  return (
    <div className={cn('text-secondary-600 flex items-center truncate', className)}>{children}</div>
  )
}

const TableCellRenderer = <T,>({ cell, className }: CellProps<T>) => {
  const context = useTableContext<T>()

  if (!context.table) throw new Error('TableCellRenderer must be used inside TableContext')

  const { table } = context

  const initialValue = cell.getValue()
  const [value, setValue] = useState(initialValue || '')
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  const isGrouped = cell.column.columnDef?.meta?.row?.isGrouped
  const isCellEditable = cell.column?.columnDef?.meta?.enableColumnEditable
  const editableColumnProps = cell.column?.columnDef?.meta?.editableColumnProps
  const tableRowLayout = table.options.meta?.layout || 'default'
  const cellClassName =
    cell.column.columnDef.meta?.cell?.className || table.options.meta?.cell?.className

  const isPinned = cell.column.getIsPinned()

  const isSelected =
    cell.row.getIsSelected() || cell.row.getParentRows().some((parent) => parent.getIsSelected())
  const inputRef = useRef<HTMLInputElement | null>(null)

  const formatterFn = cell.column.columnDef.meta?.cell?.formatterFn
  const validator = cell.column.columnDef.meta?.cell?.validator

  const layout = table.options.meta?.layout ?? 'default'

  const isActions = cell.column.id === 'actions' || cell.column.id === 'action'

  const style: CSSProperties = {
    position: 'relative',
    width: cell.column.getSize(),
    flexShrink: 0,
    paddingLeft: isGrouped ? `${cell.row.depth * 2}rem` : undefined,
  }

  const onBlur = useCallback(() => {
    if (table.options.meta?.updateData) {
      table.options.meta.updateData(
        cell.row.id,
        cell.column.id as keyof T,
        value,
        cell.column.columnDef,
      )
    }
  }, [cell, value, table])

  useEffect(() => {
    if (isCellEditable) setValue(initialValue || '')
  }, [initialValue, isCellEditable])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

  const handleClick = useCallback(() => {
    if (isCellEditable) setIsEditing(true)
  }, [isCellEditable])

  const handleFocus = useCallback(() => {
    if (isCellEditable) setIsEditing(true)
  }, [isCellEditable])

  useEffect(() => {
    if (!validator) return
    const result = validator.safeParse(cell.getValue())

    if (!result.success) {
      const firstIssue = result.error.issues?.[0]
      setError(firstIssue?.message ?? 'Valor inválido')
      setIsSuccess(false)
      return
    }

    setError('')
    setIsSuccess(true)
  }, [validator, cell.getValue()])

  const renderContent = (): ReactNode => {
    if (cell.getIsPlaceholder()) {
      return null
    }

    if (isGrouped && cell.row.subRows.length > 0) {
      const toggle = cell.row.getToggleExpandedHandler()

      if (cell.row.depth !== 0 && !cell.row.getCanExpand())
        return (
          <ExpandedContainer>
            <div className="px-2">
              <CornerDownRight className="text-foreground/70" size={12} />
            </div>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </ExpandedContainer>
        )

      return (
        <ExpandedContainer>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            className={cn(
              'cursor-pointer px-2',
              isGrouped && cell.row.depth === 0 ? 'text-primary' : '',
            )}
          >
            {cell.row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </ExpandedContainer>
      )
    }

    if (cell.getIsGrouped()) {
      const toggle = cell.row.getToggleExpandedHandler()

      if (cell.row.depth !== 0 && !cell.row.getCanExpand())
        return (
          <ExpandedContainer>
            <CornerDownRight className="text-foreground/70" size={12} />
          </ExpandedContainer>
        )

      return (
        <ExpandedContainer className="gap-1">
          <div className="flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggle()
              }}
              className={cn('text-secondary-600 mr-2 cursor-pointer')}
            >
              {cell.row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
          ({cell.row.subRows.length})
        </ExpandedContainer>
      )
    }

    if (cell.getIsAggregated()) {
      return flexRender(
        cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
        cell.getContext(),
      )
    }

    if (isCellEditable) {
      const editableColumnType = cell.column?.columnDef?.meta?.editableColumnType

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <input
                  ref={inputRef}
                  className={cn(
                    validator && !isSuccess ? 'border-red-500' : undefined,
                    validator && isSuccess ? 'border-green-500' : undefined,
                    'text-foreground h-full w-full border bg-transparent px-2 py-1 text-xs',
                  )}
                  value={value as string}
                  type={editableColumnType || 'text'}
                  onChange={(e) => setValue(e.target.value)}
                  onBlur={() => {
                    onBlur()
                    setIsEditing(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onBlur()
                    }
                  }}
                  {...editableColumnProps}
                />
              }
            />
            {error && <TooltipPanel>{error && <p>{error}</p>}</TooltipPanel>}
          </Tooltip>
        </TooltipProvider>
      )
    }

    return formatterFn ? (
      <p className={cn('text-foreground truncate text-xs', cellClassName)}>
        {formatterFn({ row: cell.row, value: cell.getValue() })}
      </p>
    ) : (
      flexRender(cell.column.columnDef.cell, cell.getContext())
    )
  }

  return (
    <div
      className={cn(
        'flex items-center truncate overflow-hidden px-4 py-1.5 text-sm',
        'bg-background group-hover:bg-accent transition-colors duration-150 ease-in',
        'nth-last[1_of_data-pinned="left"]:inset-shadow-[-7px_0_9px_-7px_rgba(0,0,0,0.1)] nth-last-[1_of_[data-pinned="left"]]:border-r',
        'nth-last-[1_of_[data-pinned="right"])]:inset-shadow-[7px_0_9px_-7px_rgba(0,0,0,0.1)] nth-last-[1_of_[data-pinned="right"]]:border-l',
        'data-[selected=true]:bg-primary/10',
        cellClassName,
        className,
      )}
      onClick={handleClick}
      tabIndex={0}
      data-grouped={cell.getIsGrouped() || cell.getIsAggregated()}
      data-selected={isSelected}
      data-pinned={isPinned}
      onFocus={handleFocus}
      style={{
        ...style,
        ...getCommonPinningStyles(cell.column, cell.column.getSize()),
      }}
    >
      {renderContent()}
    </div>
  )
}

export default TableCell
