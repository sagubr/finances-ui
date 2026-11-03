import type { DragEndEvent } from '@dnd-kit/core'
import { useDndMonitor } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Table } from '@tanstack/react-table'
import type { Virtualizer } from '@tanstack/react-virtual'
import { createContext, useCallback, useMemo } from 'react'

export type TableContextType<T> = {
  table: Table<T>
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>
  columnVirtualizer?: Virtualizer<HTMLDivElement, Element>
}

type TableContextProps<T> = {
  children: React.ReactNode
  table: Table<T>
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>
  columnVirtualizer?: Virtualizer<HTMLDivElement, Element>
}

export const TableContext = createContext<TableContextType<any>>({} as TableContextType<any>)

TableContext.displayName = 'TableContext'

export const TableContextProvider = <T,>({
  children,
  table,
  rowVirtualizer,
  columnVirtualizer,
}: TableContextProps<T>) => {
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      table?.setColumnOrder((order) => {
        const oldIndex = order.indexOf(active.id as string)
        const newIndex = order.indexOf(over.id as string)
        return arrayMove(order, oldIndex, newIndex)
      })
    }
  }, [])

  useDndMonitor({
    onDragEnd: handleDragEnd,
  })

  const contextValue = useMemo(
    () => ({
      table,
      rowVirtualizer,
      columnVirtualizer,
    }),
    [],
  )

  return <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>
}
