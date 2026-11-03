import type { ViewMode } from '@/components/ViewModeToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Inbox, Plus } from 'lucide-react'
import { memo } from 'react'
import { ResourceListSkeleton } from './ResourceListSkeleton'

type ResourceCollectionSkeletonProps = Readonly<{
  viewMode: ViewMode
  rows?: number
  cards?: number
  className?: string
}>

export const ResourceCollectionSkeleton = memo(
  ({ viewMode, rows = 7, cards = 6, className }: ResourceCollectionSkeletonProps) => {
    if (viewMode === 'grid') return <ResourceListSkeleton cards={cards} />

    return (
      <div
        className={cn('bg-card h-[520px] overflow-hidden rounded-xl border', className)}
        aria-label="Carregando tabela"
        aria-busy="true"
      >
        <div className="flex h-11 items-center gap-6 border-b px-4">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="ml-auto h-3 w-20" />
        </div>
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex h-14 items-center gap-6 border-b px-4 last:border-0">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-[min(18rem,75%)]" />
              <Skeleton className="h-2.5 w-[min(10rem,45%)]" />
            </div>
            <Skeleton className="hidden h-3 w-24 sm:block" />
            <Skeleton className="hidden h-6 w-28 rounded-full md:block" />
            <div className="ml-auto flex gap-2">
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    )
  },
)

ResourceCollectionSkeleton.displayName = 'ResourceCollectionSkeleton'

type ResourceEmptyStateProps = Readonly<{
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  actionDisabled?: boolean
}>

export const ResourceEmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled = false,
}: ResourceEmptyStateProps) => (
  <Card>
    <CardContent className="p-0">
      <Empty className="min-h-64 border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox className="size-4" />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {actionLabel && onAction && (
          <EmptyContent>
            <Button type="button" size="sm" onClick={onAction} disabled={actionDisabled}>
              <Plus className="size-4" />
              {actionLabel}
            </Button>
          </EmptyContent>
        )}
      </Empty>
    </CardContent>
  </Card>
)
