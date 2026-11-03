import { cn } from '@/lib/utils'
import type { Cell, Row } from '@tanstack/react-table'
import type { HTMLAttributes } from 'react'
import { forwardRef, useCallback } from 'react'
import { useTableContext } from '../../hooks/useTableContext'
import type { TableProps } from '../../type'
import TableCell from '../TableCell'
import TableRow from '../TableRow'

type TableBodyProps = HTMLAttributes<HTMLDivElement> & {
  rowEstimateSize?: number
  onRowClick?: TableProps<any>['onRowClick']
}

const TableBody = forwardRef<HTMLDivElement, TableBodyProps>(
  ({ rowEstimateSize, className, onRowClick, ...props }, ref) => {
    const { table, rowVirtualizer, columnVirtualizer } = useTableContext()

    if (!table) return null

    const tableBodyHeight = rowVirtualizer.getTotalSize()
    const tableRows = table.getRowModel().rows
    const virtualRows = rowVirtualizer.getVirtualItems()

    const handleRowClick = useCallback(
      (row: Row<any>) => {
        if (onRowClick) onRowClick({ row })
      },
      [onRowClick],
    )

    const getRef = useCallback((node: HTMLDivElement) => rowVirtualizer.measureElement(node), [])

    return (
      <div
        {...props}
        style={{
          height: `${tableBodyHeight}px`,
        }}
        className={cn('relative', className)}
        ref={ref}
      >
        {virtualRows.map((item) => {
          const row = tableRows[item.index]
          if (!row) return null
          const visibleCells = row.getVisibleCells()

          const leftColumns = table.getLeftVisibleLeafColumns()
          const rightColumns = table.getRightVisibleLeafColumns()
          const centerColumns = table.getCenterVisibleLeafColumns()

          const virtualColumns = columnVirtualizer?.getVirtualItems()
          const leftPadding = virtualColumns ? (virtualColumns[0]?.start ?? 0) : 0
          const rightPadding =
            virtualColumns && columnVirtualizer
              ? columnVirtualizer.getTotalSize() -
                (virtualColumns[virtualColumns.length - 1]?.end ?? 0)
              : 0

          const renderCell = (col: any) => {
            const cell = visibleCells.find((c) => c.column.id === col.id)
            if (!cell) return null
            return <TableCell key={cell.id} cell={cell as Cell<any, any>} />
          }

          return (
            <TableRow
              ref={getRef}
              data-index={item.index}
              className={cn(
                onRowClick &&
                  'hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-ring cursor-pointer transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
              )}
              {...{
                style: {
                  height: rowEstimateSize ? `${rowEstimateSize}px` : undefined,
                  transform: `translateY(${item.start}px)`,
                  position: 'absolute',
                },
              }}
              key={row.id}
              onClick={onRowClick ? () => handleRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === 'Enter' && event.target === event.currentTarget) {
                        event.preventDefault()
                        handleRowClick(row)
                      }
                    }
                  : undefined
              }
              role={onRowClick ? 'link' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
            >
              {leftColumns.map(renderCell)}

              {columnVirtualizer && virtualColumns ? (
                <>
                  {leftPadding > 0 && (
                    <div
                      style={{
                        width: leftPadding,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {virtualColumns.map((vc) => {
                    const col = centerColumns[vc.index]
                    return renderCell(col)
                  })}
                  {rightPadding > 0 && (
                    <div
                      style={{
                        width: rightPadding,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </>
              ) : (
                centerColumns.map(renderCell)
              )}

              {rightColumns.map(renderCell)}
            </TableRow>
          )
        })}
      </div>
    )
  },
)

export default TableBody
