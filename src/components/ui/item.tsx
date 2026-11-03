import { cn } from '#/lib/utils.ts'
import * as React from 'react'

export interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Item({ className, ...props }: ItemProps) {
  return (
    <div
      className={cn(
        'border-border bg-card text-card-foreground flex items-center gap-3 rounded-lg border p-3 shadow-xs transition-colors',
        className,
      )}
      {...props}
    />
  )
}

export interface ItemMediaProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ItemMedia({ className, ...props }: ItemMediaProps) {
  return <div className={cn('flex shrink-0 items-center justify-center', className)} {...props} />
}

export interface ItemContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ItemContent({ className, ...props }: ItemContentProps) {
  return (
    <div
      className={cn('flex min-w-0 flex-1 flex-col justify-center gap-0.5', className)}
      {...props}
    />
  )
}

export interface ItemTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function ItemTitle({ className, ...props }: ItemTitleProps) {
  return (
    <h4
      className={cn('text-foreground truncate text-sm font-semibold tracking-tight', className)}
      {...props}
    />
  )
}
