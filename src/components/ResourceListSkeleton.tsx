import { Skeleton } from '@/components/ui/skeleton'
import { memo } from 'react'

interface ResourceListSkeletonProps {
  readonly cards?: number
}

export const ResourceListSkeleton = memo(({ cards = 8 }: ResourceListSkeletonProps) => (
  <div
    className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    aria-label="Carregando conteúdo"
  >
    {Array.from({ length: cards }, (_, index) => (
      <div key={index} className="bg-card flex min-h-56 flex-col rounded-xl border p-5">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-3 w-5/6" />
        <div className="mt-6 grid gap-3">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="mt-auto flex items-center justify-between border-t pt-4">
          <Skeleton className="h-8 w-24" />
          <div className="flex gap-2">
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
          </div>
        </div>
      </div>
    ))}
  </div>
))

ResourceListSkeleton.displayName = 'ResourceListSkeleton'

export const CollectionExplorerSkeleton = memo(() => (
  <div
    className="grid min-h-[520px] gap-4 md:grid-cols-[320px_minmax(0,1fr)]"
    aria-label="Carregando coleções"
  >
    <div className="bg-card overflow-hidden rounded-xl border">
      <div className="border-b p-4">
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="grid gap-3 p-4">
        {[72, 88, 64, 80, 56].map((width, index) => (
          <div
            key={width}
            className="flex items-center gap-2"
            style={{ paddingLeft: `${(index % 3) * 16}px` }}
          >
            <Skeleton className="size-4 shrink-0 rounded-sm" />
            <Skeleton className="h-3" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
    </div>
    <div className="bg-card overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b p-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
        <Skeleton className="size-8 rounded-md" />
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex h-16 items-center gap-3 rounded-lg border p-3">
            <Skeleton className="size-8 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
))

CollectionExplorerSkeleton.displayName = 'CollectionExplorerSkeleton'

export const CollectionContentsSkeleton = memo(() => (
  <div
    className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
    aria-label="Carregando conteúdo da coleção"
  >
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className="flex h-16 items-center gap-3 rounded-lg border p-3">
        <Skeleton className="size-8 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
      </div>
    ))}
  </div>
))

CollectionContentsSkeleton.displayName = 'CollectionContentsSkeleton'
