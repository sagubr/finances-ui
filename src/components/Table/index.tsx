import { matchesSearchText } from '@/lib/search-text'
import { cn } from '@/lib/utils'
import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import SelectionColumn from './components/SelectionColumn'
import TableBody from './components/TableBody'
import TableContainer from './components/TableContainer'
import TableHeader from './components/TableHeader'
import TableLayout from './components/TableLayout'
import TablePagination from './components/TablePagination'
import { TableContextProvider } from './contexts/TableContext'
import TableDndContext from './contexts/TableDndContext'
import { useTableState } from './hooks/useTableState'
import type { TableCustomData, TableProps } from './type'

const Table = <T extends object>({
  columns,
  data,
  defaultColumn,
  pagination,
  tableState,
  meta,
  enableMultiRowSelection = true,
  enableRowSelection,
  className,
  rowEstimateSize,
  remeasureKey,
  shouldRenderCheckbox = true,
  manualPagination,
  persist,
  getRowId,
  onRowClick,
  getTableInstance,
  onPaginationChange,
  onColumnFiltersChange,
  onTableStateChange,
  onExpandedStateChange,
  onRowSelectionChange,
  onColumnOrderStateChange,
  onColumnVisibilityStateChange,
  onColumnPinningStateChange,
  onSortingStateChange,
  onColumnSizingChange,
  onGroupingStateChange,
  enableColumnFilters = false,
  enableColumnVirtualization = false,
  columnEstimateSize,
}: TableProps<T>) => {
  const tableRef = useRef<HTMLDivElement | null>(null)

  const {
    state,
    handleColumnFiltersChange,
    handleColumnOrderChange,
    handleColumnPinningStateChange,
    handleSortingStateChange,
    handleStateChange,
    handleColumnVisibilityChange,
    handleExpandedChange,
    handlePaginationChange,
    handleRowSelectionChange,
    handleColumnSizingStateChange,
    handleGroupingStateChange,
  } = useTableState({
    persist,
    ...tableState,
    onColumnFiltersChange,
    onTableStateChange,
    onExpandedStateChange,
    onRowSelectionChange,
    onColumnOrderStateChange,
    onColumnVisibilityStateChange,
    onColumnPinningStateChange,
    onSortingStateChange,
    onColumnSizingChange,
    onGroupingStateChange,
    onPaginationChange,
  })

  const columnsMemo = useMemo(() => {
    if (enableRowSelection && shouldRenderCheckbox) {
      return [
        SelectionColumn<T, any>({
          pagination: Boolean(state.pagination),
        }),
        ...columns,
      ]
    }
    return [...columns]
  }, [columns])

  const getColumnOrder = useCallback(() => {
    const columnOrderIds = state.columnOrder || []
    const tableIds = columnsMemo
      .map((column) => column.id || (column as any).accessorKey)
      .filter(Boolean) as string[]

    // Mantém a ordem existente apenas para as colunas que ainda existem em tableIds
    const validExisting = columnOrderIds.filter((id) => tableIds.includes(id))

    // Adiciona novas colunas montadas dinamicamente
    const newColumns = tableIds.filter((id) => !validExisting.includes(id))

    return [...validExisting, ...newColumns]
  }, [columnsMemo, state.columnOrder])

  const isPaginationEnabled = Boolean(tableState?.pagination && onPaginationChange)
  const resolvedManualPagination =
    manualPagination !== undefined ? manualPagination : !isPaginationEnabled

  const table = useReactTable({
    data,
    columns: columnsMemo,
    state,
    meta,
    manualPagination: resolvedManualPagination,
    initialState: {
      columnOrder: columnsMemo.map((column) => column.id || (column as any).accessorKey || ''),
    },
    enableMultiRowSelection,
    enableRowSelection: (row) => {
      const isLeaf = !row.getIsGrouped() || row.subRows?.length === 0

      if (typeof enableRowSelection === 'function') {
        return enableRowSelection(row) && isLeaf
      }

      return !!enableRowSelection && isLeaf
    },
    filterFromLeafRows: true,
    enableColumnFilters,
    columnResizeMode: 'onChange',
    defaultColumn: useMemo(
      () => ({
        sortingFn: (rowA: any, rowB: any, columnId: string) => {
          const a = rowA.getValue(columnId)
          const b = rowB.getValue(columnId)

          if (typeof a === 'string' && typeof b === 'string') {
            return a.localeCompare(b, 'pt-BR', { numeric: true })
          }

          if (a === b) return 0
          if (a === null || a === undefined) return 1
          if (b === null || b === undefined) return -1

          return a > b ? 1 : -1
        },
        filterFn: (row, columnId, filterValue) => {
          if (filterValue === undefined || filterValue === null || filterValue === '') return true
          const value = row.getValue(columnId)
          if (Array.isArray(filterValue)) {
            if (filterValue.length === 0) return true
            return filterValue.includes(value)
          }
          return matchesSearchText(value, filterValue)
        },
        ...defaultColumn,
      }),
      [defaultColumn],
    ),
    autoResetExpanded: false,
    getRowId,
    getSubRows: (row) => (row as TableCustomData<T>).subRows as T[] | undefined,
    onStateChange: handleStateChange,
    onColumnOrderChange: handleColumnOrderChange,
    onRowSelectionChange: handleRowSelectionChange,
    onExpandedChange: handleExpandedChange,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingStateChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnPinningChange: handleColumnPinningStateChange,
    onColumnSizingChange: handleColumnSizingStateChange,
    onGroupingChange: handleGroupingStateChange,
    getGroupedRowModel: getGroupedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    overscan: 3,
    getScrollElement: () => tableRef.current,
    estimateSize: useCallback(() => rowEstimateSize ?? 50, [rowEstimateSize]),
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  })

  useEffect(() => {
    if (remeasureKey === undefined) return
    const frame = requestAnimationFrame(() => {
      rowVirtualizer.measure()
    })
    return () => cancelAnimationFrame(frame)
  }, [remeasureKey, rowVirtualizer])

  const centerColumns = table.getCenterVisibleLeafColumns()
  const columnVirtualizer = enableColumnVirtualization
    ? useVirtualizer({
        horizontal: true,
        count: centerColumns.length,
        overscan: 3,
        getScrollElement: () => tableRef.current,
        estimateSize: useCallback(
          (index) => {
            const col = centerColumns[index]
            return columnEstimateSize || col.getSize()
          },
          [centerColumns, columnEstimateSize],
        ),
      })
    : undefined

  useEffect(() => {
    if (getTableInstance) getTableInstance(table)
  }, [])

  useEffect(() => {
    const currentOrder = state.columnOrder || []
    const newOrder = getColumnOrder()
    const isDifferent =
      currentOrder.length !== newOrder.length ||
      currentOrder.some((id, idx) => id !== newOrder[idx])

    if (isDifferent) {
      handleColumnOrderChange(newOrder)
    }
  }, [columnsMemo, getColumnOrder, handleColumnOrderChange, state.columnOrder])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        const columnOrder = getColumnOrder()
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        if (oldIndex !== -1 && newIndex !== -1) {
          handleColumnOrderChange(arrayMove(columnOrder, oldIndex, newIndex))
        }
      }
    },
    [getColumnOrder, handleColumnOrderChange],
  )

  return (
    <TableDndContext onDragEnd={handleDragEnd}>
      <TableContextProvider
        table={table}
        rowVirtualizer={rowVirtualizer}
        columnVirtualizer={columnVirtualizer}
      >
        <div
          className={cn(
            'flex h-full min-h-0 w-full max-w-full min-w-0 flex-1 flex-col overflow-hidden',
            className,
          )}
        >
          <TableContainer ref={tableRef}>
            <TableLayout>
              <TableHeader />
              <TableBody onRowClick={onRowClick} rowEstimateSize={rowEstimateSize} />
            </TableLayout>
          </TableContainer>
          {tableState?.pagination && onPaginationChange && (
            <TablePagination
              pageSize={tableState.pagination.pageSize}
              selectedPage={tableState.pagination.pageIndex}
              onPaginationChange={handlePaginationChange}
              totalItems={
                manualPagination
                  ? pagination?.totalItems || 0
                  : table.getPrePaginationRowModel().rows.length
              }
              totalPages={manualPagination ? pagination?.totalPages || 0 : table.getPageCount()}
            />
          )}
        </div>
      </TableContextProvider>
    </TableDndContext>
  )
}

export default React.memo(Table) as typeof Table
