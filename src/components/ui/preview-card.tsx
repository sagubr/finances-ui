'use client'

import { cn } from '#/lib/utils.ts'
import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card'
import * as React from 'react'

const PreviewCardContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
} | null>(null)

export function PreviewCard({
  open: controlledOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof PreviewCardPrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      setUncontrolledOpen(newOpen)
      onOpenChange?.(newOpen, undefined as any)
    },
    [onOpenChange],
  )

  React.useEffect(() => {
    if (!open) return
    const handleTouch = () => setOpen(false)
    document.addEventListener('touchstart', handleTouch)
    return () => document.removeEventListener('touchstart', handleTouch)
  }, [open, setOpen])

  return (
    <PreviewCardContext.Provider value={{ open, setOpen: setUncontrolledOpen }}>
      <PreviewCardPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
    </PreviewCardContext.Provider>
  )
}

export const PreviewCardTrigger = React.forwardRef<
  HTMLElement,
  React.ComponentProps<typeof PreviewCardPrimitive.Trigger>
>((props, ref) => {
  const ctx = React.useContext(PreviewCardContext)
  const touchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const justOpenedByTouch = React.useRef(false)

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    e.stopPropagation()
    props.onTouchStart?.(e)
    if (ctx && !ctx.open) {
      touchTimerRef.current = setTimeout(() => {
        ctx.setOpen(true)
        justOpenedByTouch.current = true
        setTimeout(() => {
          justOpenedByTouch.current = false
        }, 400)
      }, 350)
    }
  }

  const clearTouchTimer = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current)
      touchTimerRef.current = null
    }
  }

  return (
    <PreviewCardPrimitive.Trigger
      data-slot="preview-card-trigger"
      {...props}
      ref={ref as any}
      onClick={(e) => {
        if (justOpenedByTouch.current) {
          props.onClick?.(e)
          return
        }
        if (ctx) ctx.setOpen(!ctx.open)
        props.onClick?.(e)
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={(e) => {
        clearTouchTimer()
        props.onTouchEnd?.(e)
      }}
      onTouchMove={(e) => {
        clearTouchTimer()
        props.onTouchMove?.(e)
      }}
      onTouchCancel={(e) => {
        clearTouchTimer()
        props.onTouchCancel?.(e)
      }}
    />
  )
})

export const PreviewCardPopup = React.forwardRef<
  HTMLElement,
  React.ComponentProps<typeof PreviewCardPrimitive.Popup> & {
    align?: PreviewCardPrimitive.Positioner.Props['align']
    sideOffset?: PreviewCardPrimitive.Positioner.Props['sideOffset']
    anchor?: PreviewCardPrimitive.Positioner.Props['anchor']
    portalProps?: PreviewCardPrimitive.Portal.Props
  }
>(
  (
    { className, children, align = 'center', sideOffset = 4, anchor, portalProps, ...props },
    ref,
  ) => {
    return (
      <PreviewCardPrimitive.Portal {...portalProps}>
        <PreviewCardPrimitive.Positioner
          align={align}
          anchor={anchor}
          className="z-50"
          data-slot="preview-card-positioner"
          sideOffset={sideOffset}
        >
          <PreviewCardPrimitive.Popup
            ref={ref as any}
            className={cn(
              'bg-popover text-popover-foreground relative flex w-64 origin-(--transform-origin) rounded-lg border p-4 text-sm text-balance shadow-lg/5 transition-[scale,opacity] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]',
              className,
            )}
            data-slot="preview-card-content"
            onTouchStart={(e) => e.stopPropagation()}
            {...props}
          >
            {children}
          </PreviewCardPrimitive.Popup>
        </PreviewCardPrimitive.Positioner>
      </PreviewCardPrimitive.Portal>
    )
  },
)

const PreviewCardBackdrop = PreviewCardPrimitive.Backdrop
const PreviewCardPortal = PreviewCardPrimitive.Portal

export {
  PreviewCard as HoverCard,
  PreviewCardPopup as HoverCardContent,
  PreviewCardTrigger as HoverCardTrigger,
  PreviewCardBackdrop,
  PreviewCardPortal,
  PreviewCardPrimitive,
}
