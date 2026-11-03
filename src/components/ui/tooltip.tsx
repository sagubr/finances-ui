'use client'

import { cn } from '#/lib/utils.ts'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'

type TooltipProviderProps = TooltipPrimitive.Provider.Props

function TooltipProvider({ delay = 0, ...props }: TooltipProviderProps) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />
}

type TooltipProps = TooltipPrimitive.Root.Props & {
  delay?: TooltipPrimitive.Provider.Props['delay']
}

function Tooltip({ delay = 0, ...props }: TooltipProps) {
  return (
    <TooltipProvider delay={delay}>
      <TooltipPrimitive.Root {...props} />
    </TooltipProvider>
  )
}

type TooltipTriggerProps = TooltipPrimitive.Trigger.Props

function TooltipTrigger({ ...props }: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger {...props} />
}

type TooltipPanelProps = TooltipPrimitive.Positioner.Props & TooltipPrimitive.Popup.Props

function TooltipPanel({ className, sideOffset = 4, children, style, ...props }: TooltipPanelProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        sideOffset={sideOffset}
        className="isolate z-50 outline-none"
        {...props}
      >
        <TooltipPrimitive.Popup
          className={cn(
            'bg-primary text-primary-foreground w-fit origin-(--transform-origin) rounded-md px-3 py-1.5 text-xs text-balance shadow-md outline-none',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className,
          )}
          style={style}
        >
          {children}
          <TooltipPrimitive.Arrow className="fill-primary z-50 size-3 data-[side='bottom']:translate-y-[1px] data-[side='left']:translate-x-[-1px] data-[side='right']:translate-x-[1px] data-[side='top']:translate-y-[-1px]" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export {
  Tooltip,
  TooltipPanel,
  TooltipProvider,
  TooltipTrigger,
  type TooltipPanelProps,
  type TooltipProps,
  type TooltipProviderProps,
  type TooltipTriggerProps,
}
