import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  Ban,
  CircleOff,
  Inbox,
  RefreshCw,
  SearchX,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

type SettingsPageStateVariant =
  'empty' | 'filtered-empty' | 'unavailable' | 'forbidden' | 'error' | 'stale'

const variantConfig: Record<
  SettingsPageStateVariant,
  { icon: LucideIcon; role: 'status' | 'alert'; iconClassName?: string }
> = {
  empty: { icon: Inbox, role: 'status' },
  'filtered-empty': { icon: SearchX, role: 'status' },
  unavailable: { icon: CircleOff, role: 'status' },
  forbidden: { icon: Ban, role: 'alert', iconClassName: 'text-destructive' },
  error: { icon: AlertCircle, role: 'alert', iconClassName: 'text-destructive' },
  stale: { icon: RefreshCw, role: 'status', iconClassName: 'text-amber-600' },
}

type SettingsPageStateProps = {
  readonly variant: SettingsPageStateVariant
  readonly title: string
  readonly description: ReactNode
  readonly action?: ReactNode
  readonly className?: string
}

export function SettingsPageState({
  variant,
  title,
  description,
  action,
  className,
}: SettingsPageStateProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div
      role={config.role}
      className={cn(
        'bg-muted/20 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center',
        className,
      )}
    >
      <div className="bg-background mb-4 rounded-full border p-3 shadow-xs">
        <Icon className={cn('text-muted-foreground size-6', config.iconClassName)} />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <div className="text-muted-foreground mt-2 max-w-xl text-sm">{description}</div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function SettingsRetryAction({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={onRetry} className="gap-2">
      <RefreshCw className="size-4" />
      Tentar novamente
    </Button>
  )
}
