import type { ReactNode } from 'react'

type Falsy = null | undefined | false | 0 | ''

type ShowProps<T> = {
  when: T | Falsy
  fallback?: ReactNode
  children: (value: NonNullable<T>) => ReactNode
}

function Show<T>({ when, fallback = null, children }: ShowProps<T>): ReactNode {
  if (when) {
    return children(when)
  }
  return fallback
}

export default Show
