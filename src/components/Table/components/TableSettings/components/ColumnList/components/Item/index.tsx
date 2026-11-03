import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Column, ColumnOrderState } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Eye,
  EyeOff,
  GripHorizontal,
} from 'lucide-react'
import type { CSSProperties } from 'react'

interface ItemProps<T> {
  column: Column<T>
  columnOrder: ColumnOrderState
  setColumnOrder: (columnOrder: ColumnOrderState) => void
}

const reorder = ({
  columnOrder,
  from,
  to,
}: {
  columnOrder: ColumnOrderState
  from: string
  to: string
}) => {
  const oldIndex = columnOrder.indexOf(from)
  const newIndex = columnOrder.indexOf(to)
  return arrayMove(columnOrder, oldIndex, newIndex)
}

const Item = <T,>({ column, columnOrder, setColumnOrder }: ItemProps<T>) => {
  const { attributes, isDragging, listeners, transform, setNodeRef } = useSortable({
    id: column.id,
  })

  const isVisible = column.getIsVisible()

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    zIndex: isDragging ? 1 : 0,
  }

  const reorderUp = () => {
    const index = columnOrder.indexOf(column.id)
    const newIndex = index - 1

    if (newIndex >= 0) {
      setColumnOrder(
        reorder({
          columnOrder,
          from: column.id,
          to: columnOrder[newIndex],
        }),
      )
    }
  }

  const reorderDown = () => {
    const index = columnOrder.indexOf(column.id)
    const newIndex = index + 1

    if (newIndex < columnOrder.length) {
      setColumnOrder(
        reorder({
          columnOrder,
          from: column.id,
          to: columnOrder[newIndex],
        }),
      )
    }
  }

  return (
    <div
      id={column.id}
      key={column.id}
      style={{ ...style }}
      ref={setNodeRef}
      onClick={(e) => {
        e.preventDefault()
        e.currentTarget.focus()
      }}
      className="group hover:text-primary-600 focus:text-primary-600 focus:ring-primary-600 hover:bg-accent focus:bg-accent flex items-center justify-between overflow-hidden rounded-md px-2 py-1 focus:ring-1"
      tabIndex={0}
    >
      <div className="flex items-center gap-2">
        <Button
          {...attributes}
          {...listeners}
          className="hover:bg-transparent"
          disabled={!isVisible || !!column.getIsPinned()}
          variant={'ghost'}
          size={'icon'}
        >
          <GripHorizontal
            size={16}
            className={cn(column.getIsPinned() ? 'text-neutral-400' : 'text-neutral-500')}
          />
        </Button>
        <p
          className={cn(
            'text-elipsis dark:group-focus:text-primary-500 group-focus:text-primary-600 flex-1 overflow-hidden',
            !isVisible && 'text-neutral-400',
          )}
        >
          {column.accessorFn ? column.columnDef.header?.toString() : column.id}
        </p>
      </div>
      <div className="flex items-center">
        <Button
          className={cn(
            'hover:text-primary-600 rounded-md dark:hover:bg-zinc-900',
            !isVisible && 'text-neutral-400 hover:bg-neutral-200 hover:text-neutral-400',
          )}
          onClick={() => column.toggleVisibility()}
          variant={'ghost'}
          size={'icon'}
        >
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </Button>
        <Button
          className={cn(
            'hover:text-primary-600 rounded-md hover:bg-neutral-200 dark:hover:bg-zinc-900',
          )}
          variant={'ghost'}
          size={'icon'}
          disabled={!isVisible}
          onClick={reorderUp}
        >
          <ArrowUp size={14} />
        </Button>
        <Button
          className={cn(
            'hover:text-primary-600 rounded-md hover:bg-neutral-200 dark:hover:bg-zinc-900',
          )}
          variant={'ghost'}
          size={'icon'}
          disabled={!isVisible}
          onClick={reorderDown}
        >
          <ArrowDown size={14} />
        </Button>
        <Button
          className={cn(
            'hover:text-primary-600 rounded-md hover:bg-neutral-200 dark:hover:bg-zinc-900',
            column.getIsPinned() === 'left' &&
              'bg-primary-300 hover:bg-primary-300 text-white hover:text-white',
          )}
          variant={'ghost'}
          size={'icon'}
          disabled={!isVisible}
          onClick={() =>
            column.getIsPinned()
              ? column.getIsPinned() === 'right'
                ? column.pin('left')
                : column.pin(false)
              : column.pin('left')
          }
        >
          <ArrowLeft size={14} />
        </Button>
        <Button
          className={cn(
            'hover:text-primary-600 rounded-md hover:bg-neutral-200 dark:hover:bg-zinc-900',
            column.getIsPinned() === 'right' &&
              'bg-primary-300 hover:bg-primary-300 text-white hover:text-white',
          )}
          variant={'ghost'}
          size={'icon'}
          disabled={!isVisible}
          onClick={() =>
            column.getIsPinned()
              ? column.getIsPinned() === 'left'
                ? column.pin('right')
                : column.pin(false)
              : column.pin('right')
          }
        >
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  )
}

export default Item
