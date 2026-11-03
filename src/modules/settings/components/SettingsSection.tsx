import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
export function SettingsSection({
  title,
  description,
  icon: Icon,
  primaryAction,
  secondaryActions,
  status,
  children,
}: {
  readonly title: string
  readonly description: string
  readonly icon: LucideIcon
  readonly primaryAction?: ReactNode
  readonly secondaryActions?: ReactNode
  readonly status?: ReactNode
  readonly children: ReactNode
}) {
  return (
    <section className="w-full max-w-full min-w-0">
      <header className="flex max-w-full min-w-0 flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight">{title}</h2>
              {status}
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{description}</p>
          </div>
        </div>
        {(primaryAction || secondaryActions) && (
          <div className="flex max-w-full shrink-0 flex-wrap items-center gap-2">
            {secondaryActions}
            {primaryAction}
          </div>
        )}
      </header>
      <div className="w-full max-w-full min-w-0 pt-4">{children}</div>
    </section>
  )
}
