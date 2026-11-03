import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'
import { useTableContext } from '../../hooks/useTableContext'
import TableColumnHeader from '../TableColumnHeader'
import TableHeaderRow from '../TableHeaderRow'

type TableHeaderProps = HTMLAttributes<HTMLDivElement>

const TableHeader = ({ className, ...props }: TableHeaderProps) => {
  const { table, columnVirtualizer } = useTableContext()

  if (!table) return null

  return (
    <div {...props} className={cn('bg-background sticky top-0 z-10 h-auto', className)}>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableHeaderRow key={headerGroup.id} headerGroup={headerGroup} className="w-full">
          {(() => {
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

            const renderHeader = (col: any) => {
              const header = headerGroup.headers.find((h) => h.column.id === col.id)
              if (!header) return null
              return <TableColumnHeader key={header.id} header={header} />
            }

            // If not virtualizing, just map all headers normally to support grouped headers
            if (!columnVirtualizer || !virtualColumns) {
              return headerGroup.headers.map((header) => (
                <TableColumnHeader key={header.id} header={header} />
              ))
            }

            return (
              <>
                {leftColumns.map(renderHeader)}

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
                  return renderHeader(col)
                })}
                {rightPadding > 0 && (
                  <div
                    style={{
                      width: rightPadding,
                      flexShrink: 0,
                    }}
                  />
                )}

                {rightColumns.map(renderHeader)}
              </>
            )
          })()}
        </TableHeaderRow>
      ))}
    </div>
  )
}

export default TableHeader
