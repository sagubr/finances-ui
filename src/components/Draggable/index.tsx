import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/core'
import React from 'react'

type DraggableProps<T> = {
  id: string
  data: T
  type: string
  children?: React.ReactNode
  render?: React.ReactElement
}

const Draggable = <T,>({ data, id, render, children, type }: DraggableProps<T>) => {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id,
    data: {
      type,
      data: data,
    },
  })

  const mergedProps = {
    ref: setNodeRef,
    className: cn(isDragging && 'opacity-40'),
    ...attributes,
    ...listeners,
  }

  if (render) {
    return React.cloneElement(render, mergedProps)
  }

  return <div {...mergedProps}>{children}</div>
}

export default Draggable
