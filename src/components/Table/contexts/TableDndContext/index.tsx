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
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import type { ReactNode } from 'react'

const horizontalCollisionDetection: CollisionDetection = (args) => {
  // 1. Pointer within droppable accurately selects the target column under the cursor
  const pointerCollisions = pointerWithin(args)
  if (pointerCollisions.length > 0) {
    return pointerCollisions
  }

  // 2. Rect intersection when pointer is near or slightly offset
  const rectCollisions = rectIntersection(args)
  if (rectCollisions.length > 0) {
    return rectCollisions
  }

  // 3. Fallback to closestCenter
  return closestCenter(args)
}

type TableDndContextProps = {
  children: ReactNode
  onDragEnd?: (event: DragEndEvent) => void
}

const TableDndContext = ({ children, onDragEnd }: TableDndContextProps) => {
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  return (
    <DndContext
      collisionDetection={horizontalCollisionDetection}
      modifiers={[restrictToHorizontalAxis]}
      sensors={sensors}
      onDragEnd={onDragEnd}
    >
      {children}
    </DndContext>
  )
}

export default TableDndContext
