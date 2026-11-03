import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { CollisionDetection, DragEndEvent } from '@dnd-kit/core'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ColumnOrderState, Table } from '@tanstack/react-table'
import { Columns, Eye, EyeOff, FilterX, PinOff, RotateCcw } from 'lucide-react'
import Item from './components/Item'

const verticalCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  if (pointerCollisions.length > 0) return pointerCollisions
  const rectCollisions = rectIntersection(args)
  if (rectCollisions.length > 0) return rectCollisions
  return closestCenter(args)
}

interface ColumnListProps<T> {
  table: Table<T>
  columnOrder: ColumnOrderState
}

const ColumnList = <T,>({ table }: ColumnListProps<T>) => {
  const { setColumnOrder, getAllColumns } = table

  const columns = getAllColumns()
  const validColumnIds = columns.map((column) => column.id)
  const currentOrder = table.getState().columnOrder || []

  const columnOrder = Array.from(
    new Set([...currentOrder.filter((id) => validColumnIds.includes(id)), ...validColumnIds]),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active && over && active.id !== over.id) {
      setColumnOrder(() => {
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(columnOrder, oldIndex, newIndex)
        }
        return columnOrder
      })
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  return (
    <ScrollArea>
      <DndContext
        collisionDetection={verticalCollisionDetection}
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div
          className="px-4 py-2 focus:bg-transparent focus:text-neutral-500"
          onClick={(e) => e.preventDefault()}
        >
          <Button
            className="hover:bg-accent hover:text-primary flex h-[40px] w-full items-center justify-start gap-4 text-sm"
            variant={'ghost'}
            onClick={() => {
              table.toggleAllColumnsVisible(!table.getIsAllColumnsVisible())
            }}
          >
            {table.getIsAllColumnsVisible() ? (
              <>
                <Eye size={14} />
                Ocultar tudo
              </>
            ) : (
              <>
                <EyeOff size={14} />
                Mostrar tudo
              </>
            )}
          </Button>
          <Button
            className="hover:bg-accent hover:text-primary flex h-[40px] w-full items-center justify-start gap-4 text-sm"
            variant={'ghost'}
            onClick={() => table.resetColumnFilters()}
          >
            <FilterX size={14} />
            Remover filtros
          </Button>
          <Button
            className="hover:bg-accent hover:text-primary flex h-[40px] w-full items-center justify-start gap-4 text-sm"
            variant={'ghost'}
            onClick={() => table.resetColumnPinning(true)}
            disabled={!table.getIsSomeColumnsPinned()}
          >
            <PinOff size={14} />
            Desfixar tudo
          </Button>
          <Button
            className="hover:bg-accent hover:text-primary flex h-[40px] w-full items-center justify-start gap-4 text-sm"
            variant={'ghost'}
            onClick={() => {
              table.reset()
              table.resetColumnOrder(true)
            }}
          >
            <RotateCcw size={14} />
            Resetar tabela
          </Button>
          <div className="p-2" />
          <Separator />
          <div className="flex items-center gap-2 p-4 font-semibold text-neutral-700">
            <Columns size={14} />
            <p>Colunas</p>
          </div>
          <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
            {columnOrder.map((ord: string) => {
              const column = columns.find((col) => col.id === ord)

              return column ? (
                <Item
                  key={column.id}
                  column={column}
                  columnOrder={columnOrder}
                  setColumnOrder={setColumnOrder}
                />
              ) : null
            })}
          </SortableContext>
          <div className="p-4" />
        </div>
      </DndContext>
    </ScrollArea>
  )
}

export default ColumnList
