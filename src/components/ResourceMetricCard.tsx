import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export const ResourceMetricCard = ({
  label,
  value,
  tone = 'neutral',
  className,
}: Readonly<{
  label: string
  value: ReactNode
  tone?: 'neutral' | 'positive' | 'negative'
  className?: string
}>) => (
  <div
    className={cn(
      'bg-card min-w-0 rounded-lg px-3 py-2.5 ring-1',
      className,
      tone === 'positive'
        ? 'bg-emerald-500/[0.06] ring-emerald-500/20'
        : tone === 'negative'
          ? 'bg-destructive/[0.06] ring-destructive/20'
          : 'ring-foreground/10',
    )}
  >
    <p
      className={cn(
        'truncate text-[11px] font-medium',
        tone === 'positive'
          ? 'text-emerald-700 dark:text-emerald-300'
          : tone === 'negative'
            ? 'text-destructive'
            : 'text-muted-foreground',
      )}
    >
      {label}
    </p>
    <p
      className={cn(
        'mt-1 truncate text-base font-semibold tabular-nums',
        tone === 'positive' && 'text-emerald-700 dark:text-emerald-300',
        tone === 'negative' && 'text-destructive',
      )}
      title={typeof value === 'string' || typeof value === 'number' ? String(value) : undefined}
    >
      {value}
    </p>
  </div>
)
