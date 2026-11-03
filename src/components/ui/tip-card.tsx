'use client'

import { Button } from '#/components/ui/button.tsx'
import { cn } from '#/lib/utils.ts'
import { Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'

export interface TipCardAction {
  readonly label: string
  readonly onClick: () => void
}

export interface TipCardProps {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly action?: TipCardAction
  readonly tone?: 'neutral' | 'discovery' | 'warning'
  readonly placement?: 'inline' | 'floating'
  readonly onDismiss?: () => void
  readonly className?: string
  readonly icon?: React.ReactNode
}

const TIP_STORAGE_PREFIX = 'tip_dismissed_'

const wasTipDismissed = (storageKey: string): boolean => {
  try {
    return globalThis.localStorage?.getItem(storageKey) === 'true'
  } catch {
    return false
  }
}

const persistTipDismissal = (storageKey: string): void => {
  try {
    globalThis.localStorage?.setItem(storageKey, 'true')
  } catch {
    // A dica continua dispensada durante a sessão mesmo quando o storage não está disponível.
  }
}

const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    if (typeof globalThis.matchMedia !== 'function') return
    const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    if (!mediaQuery) return
    const updatePreference = () => setReduced(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener?.('change', updatePreference)
    return () => mediaQuery.removeEventListener?.('change', updatePreference)
  }, [])

  return reduced
}

const TONE_CLASS_NAMES: Record<NonNullable<TipCardProps['tone']>, string> = {
  neutral: 'border-border',
  discovery: 'border-primary/30',
  warning: 'border-amber-500/40',
}

export function TipCard({
  id,
  title,
  description,
  action,
  tone = 'discovery',
  placement = 'inline',
  onDismiss,
  className,
  icon = <Sparkles className="text-primary size-4" />,
}: TipCardProps) {
  const storageKey = `${TIP_STORAGE_PREFIX}${id}`
  const shouldReduceMotion = usePrefersReducedMotion()
  const [isOpen, setIsOpen] = React.useState(() => !wasTipDismissed(storageKey))

  const handleDismiss = () => {
    setIsOpen(false)
    persistTipDismissal(storageKey)
    onDismiss?.()
  }

  const handleAction = () => action?.onClick()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 15, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.95 }}
          transition={
            shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }
          }
          role={tone === 'warning' ? 'status' : 'note'}
          data-placement={placement}
          className={cn(
            'bg-card text-foreground relative flex w-full gap-3 rounded-xl border p-4 shadow-sm',
            TONE_CLASS_NAMES[tone],
            placement === 'floating' && 'fixed right-4 bottom-4 z-50',
            className,
          )}
        >
          <div className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-lg">
            {icon}
          </div>

          <div className="flex-1 space-y-1">
            <h4 className="text-sm leading-none font-semibold tracking-tight">{title}</h4>
            <p className="text-foreground/70 text-xs leading-relaxed">{description}</p>
            {action && (
              <Button
                type="button"
                variant="link"
                size="xs"
                onClick={handleAction}
                className="mt-1 h-auto px-0 text-xs"
              >
                {action.label}
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleDismiss}
            aria-label="Dispensar dica"
            className="text-foreground/70 hover:text-foreground absolute top-2 right-2"
          >
            <X aria-hidden="true" className="size-3.5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
