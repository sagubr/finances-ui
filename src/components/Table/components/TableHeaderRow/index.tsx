import { cn } from '@/lib/utils'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import type { HeaderGroup } from '@tanstack/react-table'
import type { HTMLAttributes } from 'react'
import { useMemo } from 'react'
import { useTableContext } from '../../hooks/useTableContext'

type TableHeaderRowProps<T> = {
  headerGroup: HeaderGroup<T>
} & HTMLAttributes<HTMLDivElement>

const TableHeaderRow = <T,>({
  className,
  children,
  headerGroup,
  ...props
}: TableHeaderRowProps<T>) => {
  const { table } = useTableContext()

  if (!table) return null

  const columnOrder = useMemo(() => {
    const order = table.getState().columnOrder
    if (order && order.length > 0) return order
    return headerGroup.headers.map((h) => h.column.id)
  }, [table.getState().columnOrder, headerGroup.headers])

  return (
    <div {...props} className={cn('flex border-b', className)}>
      <SortableContext
        id={headerGroup.id}
        items={columnOrder}
        strategy={horizontalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </div>
  )
}

export default TableHeaderRow
