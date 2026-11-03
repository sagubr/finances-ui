import { Skeleton } from '@/components/ui/skeleton'
import { memo } from 'react'

export const SettingsTableSkeleton = memo(
  ({
    rows = 6,
    filters = 2,
    toolbar = false,
  }: {
    readonly rows?: number
    readonly filters?: number
    readonly toolbar?: boolean
  }) => (
    <div className="grid w-full min-w-0 gap-4" aria-label="Carregando dados">
      {toolbar && (
        <div className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row">
          <Skeleton className="h-8 min-w-0 flex-1 rounded-md" />
          {Array.from({ length: filters }, (_, index) => (
            <Skeleton key={index} className="h-8 w-full rounded-md sm:w-44" />
          ))}
          <Skeleton className="size-8 shrink-0 self-end rounded-md sm:self-auto" />
        </div>
      )}
      <div className="overflow-hidden rounded-xl border">
        <div className="flex items-center gap-6 border-b px-4 py-3">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="ml-auto h-3 w-16" />
        </div>
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="flex min-h-14 items-center gap-4 border-b px-4 py-3 last:border-b-0"
          >
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-40 max-w-full" />
              <Skeleton className="h-2.5 w-28 max-w-[70%]" />
            </div>
            <Skeleton className="hidden h-6 w-24 rounded-md sm:block" />
            <Skeleton className="hidden h-6 w-20 rounded-md md:block" />
            <Skeleton className="size-8 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  ),
)

SettingsTableSkeleton.displayName = 'SettingsTableSkeleton'

export const SettingsOverviewSkeleton = memo(() => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Carregando resumo">
    {Array.from({ length: 5 }, (_, index) => (
      <div key={index} className="rounded-xl border p-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-4 h-7 w-14" />
      </div>
    ))}
  </div>
))

SettingsOverviewSkeleton.displayName = 'SettingsOverviewSkeleton'

export const CatalogSettingsSkeleton = memo(() => (
  <div className="grid w-full gap-6" aria-label="Carregando catálogo" aria-busy="true">
    <div className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="size-4 shrink-0 rounded-full" />
        <Skeleton className="h-3 w-24 shrink-0" />
        <Skeleton className="h-9 w-full max-w-72 rounded-md" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="size-9 rounded-md" />
        ))}
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-xl border p-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-7 w-16" />
        </div>
      ))}
    </div>

    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-8 w-36 rounded-lg" />
        <Skeleton className="h-8 w-44 rounded-lg" />
      </div>
      <div className="overflow-hidden rounded-xl border">
        <div className="flex items-center justify-between gap-4 border-b p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-72 max-w-full" />
            <Skeleton className="h-3 w-96 max-w-full" />
          </div>
          <Skeleton className="size-9 shrink-0 rounded-md" />
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
          <Skeleton className="h-9 w-full self-end rounded-md" />
        </div>
      </div>
    </div>
  </div>
))

CatalogSettingsSkeleton.displayName = 'CatalogSettingsSkeleton'
