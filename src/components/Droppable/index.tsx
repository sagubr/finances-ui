import { cn } from '@/lib/utils'
import { useDroppable } from '@dnd-kit/core'
import React from 'react'

export type DroppableAccepts = {
  type: string[]
}

type DroppableProps<T> = {
  id: string
  accepts: DroppableAccepts
  children?: React.ReactNode
  className?: string
  data: T
  render?: React.ReactElement
}

const Droppable = <T,>({ id, accepts, children, className, data, render }: DroppableProps<T>) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      data,
      accepts,
    },
  })

  const mergedProps = {
    ref: setNodeRef,
    className: cn(className, isOver && 'bg-accent/80'),
  }

  if (render) {
    return React.cloneElement(render, mergedProps)
  }

  return <div {...mergedProps}>{children}</div>
}

export default Droppable
