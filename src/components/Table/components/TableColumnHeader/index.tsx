import If from '@/components/If'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Header, Table } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import type { ClassValue } from 'clsx'
import { ArrowDown, ArrowUp, ListFilter, Pin, Tally2 } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useTableContext } from '../../hooks/useTableContext'
import { getCommonPinningStyles } from '../../utils'
import { Filter } from '../Filter'
import HeaderActions from './components/HeaderActions'

type TableColumnHeaderProps<TData> = {
  header: Header<TData, any>
  className?: ClassValue
}

const TableColumnHeader = <T,>({ header, className }: TableColumnHeaderProps<T>) => {
  const { table } = useTableContext()

  const isActions = header.column.id === 'actions' || header.column.id === 'action'

  const enableReorder = header.column.columnDef.meta?.enableColumnOrdering ?? !isActions

  const enableMenu = header.column.columnDef.meta?.enableMenu ?? !isActions

  const layout = table.options.meta?.layout ?? 'default'

  const canSort = header.column.getCanSort()

  const headerClassName =
    header.column.columnDef.meta?.header?.className || table.options.meta?.header?.className

  const isPinned = header.column.getIsPinned()
  const isGrouped = header.column.getIsGrouped()

  const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({
    id: header.column.id,
    disabled: !enableReorder || !!header.column.getIsPinned(),
  })

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition: 'transform 0.2s ease-in-out',
    width: header.getSize(),
    flexShrink: 0,
    zIndex: isDragging ? 50 : 0,
  }

  const renderContent = () => {
    if (header.isPlaceholder) return null

    return flexRender(header.column.columnDef.header, header.getContext())
  }

  return (
    <div
      ref={setNodeRef}
      key={header.id}
      style={{
        ...style,
        ...getCommonPinningStyles(header.column, header.getSize()),
      }}
      className={cn(
        'group bg-background overflow-visible p-3.5 text-sm font-semibold',
        '[&:nth-last-child(1_of_[data-pinned="left"])]:border-r [&:nth-last-child(1_of_[data-pinned="left"])]:inset-shadow-[-7px_0_9px_-7px_rgba(0,0,0,0.1)]',
        '[&:nth-last-child(1_of_[data-pinned="right"])]:border-l [&:nth-last-child(1_of_[data-pinned="right"])]:inset-shadow-[7px_0_9px_-7px_rgba(0,0,0,0.1)]',
        isDragging && 'border-primary bg-primary/10 z-50 border-x-2 border-y-0 border-t-2',
        layout === 'stretch' && 'last:border-r-0',
        canSort && 'select-none',
        headerClassName,
        className,
      )}
      data-pinned={isPinned}
    >
      <div className="flex w-full items-center">
        <If
          condition={isGrouped}
          onTrue={<div className="bg-primary mr-2 size-2 rounded-full" />}
        />
        <div className="flex-1 truncate">{renderContent()}</div>
        <If
          condition={enableReorder && !header.isPlaceholder}
          onTrue={
            <Button
              className={cn(
                'flex cursor-grab items-center justify-center hover:bg-transparent',
                isDragging && 'cursor-grabbing',
              )}
              variant="ghost"
              size="icon"
              {...attributes}
              {...listeners}
              disabled={!!header.column.getIsPinned()}
            >
              <Tally2 className="text-foreground/70 group-hover:text-foreground mt-2 size-4 rotate-90" />
            </Button>
          }
        />
        <If
          condition={header.column.getIsFiltered() && !header.isPlaceholder}
          onTrue={
            <button className="h-4 w-4">
              <ListFilter size={14} className="text-foreground/70" />
            </button>
          }
        />
        <If
          condition={enableMenu}
          onTrue={<HeaderActions table={table as Table<T>} header={header} />}
        />
        <If condition={Boolean(isPinned)} onTrue={<Pin className="shrink-0" size={14} />} />
        <If
          condition={header.column.getCanSort() && !header.isPlaceholder}
          onTrue={
            {
              asc: <ArrowUp size={14} className="text-foreground/70" />,
              desc: <ArrowDown size={14} className="text-foreground/70" />,
            }[header.column.getIsSorted() as string]
          }
        />
        <If
          condition={header.column.getCanResize() && !header.isPlaceholder}
          onTrue={
            <div
              onMouseDown={header.getResizeHandler()}
              onTouchStart={header.getResizeHandler()}
              className="group/resize absolute top-0 -right-2 bottom-0 z-10 flex w-4 cursor-col-resize touch-none items-center justify-center select-none"
            >
              <div
                className={cn(
                  'h-full w-[1px] transition-colors',
                  header.column.getIsResizing()
                    ? 'bg-primary w-[2px]'
                    : 'group-hover/resize:bg-border bg-transparent',
                )}
              />
              <div
                className={cn(
                  'bg-border absolute z-20 flex h-6 w-1 shrink-0 rounded-lg opacity-0 transition-opacity group-hover/resize:opacity-100',
                  header.column.getIsResizing() && 'bg-primary opacity-100',
                )}
              />
            </div>
          }
        />
      </div>
      <If
        condition={header.column.getCanFilter() && !header.isPlaceholder}
        onTrue={<Filter column={header.column} />}
      />
    </div>
  )
}

export default TableColumnHeader
