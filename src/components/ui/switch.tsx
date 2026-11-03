'use client'

import { cn } from '#/lib/utils.ts'
import { Switch as BaseSwitch } from '@base-ui/react/switch'
import * as React from 'react'

type SwitchProps = BaseSwitch.Root.Props & {
  pressedWidth?: number
  startIcon?: React.ReactElement
  endIcon?: React.ReactElement
  thumbIcon?: React.ReactElement
}

const Switch = React.memo(
  React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ className, pressedWidth = 19, startIcon, endIcon, thumbIcon, ...props }, ref) => {
      return (
        <BaseSwitch.Root
          ref={ref}
          className={cn(
            'group/switch peer focus-visible:border-ring focus-visible:ring-ring/50 relative flex h-5 w-8 shrink-0 items-center justify-start rounded-full border border-transparent px-px shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
            'data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-checked:justify-end',
            className,
          )}
          style={
            {
              '--pressed-width': `${pressedWidth}px`,
            } as React.CSSProperties
          }
          {...props}
        >
          <BaseSwitch.Thumb
            className={cn(
              'bg-background dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground pointer-events-none relative z-10 block size-4 rounded-full ring-0',
              'transition-all duration-300 ease-out',
              'group-active/switch:w-[var(--pressed-width)]',
            )}
          >
            {thumbIcon && (
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 [&_svg]:size-[9px]">
                {thumbIcon}
              </span>
            )}
          </BaseSwitch.Thumb>

          {startIcon && (
            <span className="pointer-events-none absolute top-1/2 left-0.5 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 [&_svg]:size-[9px]">
              {startIcon}
            </span>
          )}
          {endIcon && (
            <span className="pointer-events-none absolute top-1/2 right-0.5 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 [&_svg]:size-[9px]">
              {endIcon}
            </span>
          )}
        </BaseSwitch.Root>
      )
    },
  ),
)

const SwitchPrimitive = BaseSwitch.Root
const SwitchThumbPrimitive = BaseSwitch.Thumb
const SwitchIconPrimitive = () => null

type SwitchPrimitiveProps = BaseSwitch.Root.Props

export {
  Switch,
  SwitchIconPrimitive,
  SwitchPrimitive,
  SwitchThumbPrimitive,
  type SwitchPrimitiveProps,
  type SwitchProps,
}
