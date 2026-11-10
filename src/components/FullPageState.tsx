import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type FullPageStateProps = Readonly<{
  icon: LucideIcon
  eyebrow: string
  title: string
  description: ReactNode
  actions?: ReactNode
  detail?: ReactNode
  tone?: 'primary' | 'destructive'
  role?: 'status' | 'alert'
}>

export const FullPageState = ({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  detail,
  tone = 'primary',
  role = 'status',
}: FullPageStateProps) => (
  <main className="bg-background fixed inset-0 z-50 overflow-y-auto" role={role}>
    <div className="mx-auto flex min-h-dvh w-full max-w-lg items-center justify-center px-5 py-10 sm:px-8">
      <div className="flex w-full flex-col items-center text-center">
        <div
          className={cn(
            'mb-5 flex size-12 items-center justify-center rounded-xl border',
            tone === 'destructive'
              ? 'border-destructive/20 bg-destructive/10 text-destructive'
              : 'border-primary/20 bg-primary/10 text-primary',
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>

        <p
          className={cn(
            'mb-2 text-xs font-semibold tracking-[0.16em] uppercase',
            tone === 'destructive' ? 'text-destructive' : 'text-primary',
          )}
        >
          {eyebrow}
        </p>
        <h1 className="font-heading text-foreground text-xl font-semibold tracking-tight text-balance sm:text-2xl">
          {title}
        </h1>
        <div className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed text-pretty">
          {description}
        </div>

        {detail && <div className="mt-5 w-full">{detail}</div>}
        {actions && (
          <div className="mt-6 grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-center [&>*]:w-full sm:[&>*]:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  </main>
)
