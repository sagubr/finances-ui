'use client'

import { cn } from '#/lib/utils.ts'
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import type * as React from 'react'

export const Combobox: typeof ComboboxPrimitive.Root = ComboboxPrimitive.Root

export function ComboboxTrigger({
  className,
  alignItemWithTrigger,
  ...props
}: ComboboxPrimitive.Trigger.Props & {
  alignItemWithTrigger?: any
}): React.ReactElement {
  return (
    <ComboboxPrimitive.Trigger
      className={className}
      data-slot="combobox-trigger"
      {...(props as any)}
    />
  )
}

export function ComboboxValue({
  className,
  ...props
}: ComboboxPrimitive.Value.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Value
      className={cn('data-placeholder:text-foreground/70 flex-1 truncate', className)}
      data-slot="combobox-value"
      {...props}
    />
  )
}

export interface ComboboxInputProps extends ComboboxPrimitive.Input.Props {
  startAddon?: React.ReactNode
  endAddon?: React.ReactNode
  showTrigger?: boolean
}

export function ComboboxInput({
  className,
  startAddon,
  endAddon,
  showTrigger = false,
  ...props
}: ComboboxInputProps): React.ReactElement {
  return (
    <div className="relative flex w-full items-center" data-slot="combobox-input-wrapper">
      {startAddon && (
        <span className="text-foreground/70 pointer-events-none absolute left-2.5 flex items-center [&_svg]:size-4">
          {startAddon}
        </span>
      )}
      <ComboboxPrimitive.Input
        className={cn(
          'border-input placeholder:text-foreground/70 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          startAddon ? 'ps-9' : 'ps-3',
          endAddon ? 'pe-9' : 'pe-3',
          className,
        )}
        data-slot="combobox-input"
        {...props}
      />
      {endAddon && (
        <span className="text-foreground/70 pointer-events-none absolute right-2.5 flex items-center [&_svg]:size-4">
          {endAddon}
        </span>
      )}
    </div>
  )
}

export function ComboboxEmpty({
  className,
  ...props
}: ComboboxPrimitive.Empty.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Empty
      className={cn('text-foreground/70 p-4 text-center text-sm empty:hidden', className)}
      data-slot="combobox-empty"
      {...props}
    />
  )
}

export function ComboboxList({
  className,
  ...props
}: ComboboxPrimitive.List.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.List
      className={cn('max-h-(--available-height) overflow-y-auto p-1', className)}
      data-slot="combobox-list"
      {...props}
    />
  )
}

export function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Item
      className={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground grid min-h-8 cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-base outline-none in-data-[side=none]:min-w-[calc(var(--anchor-width)+1.25rem)] data-disabled:pointer-events-none data-disabled:opacity-64 sm:min-h-7 sm:text-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-slot="combobox-item"
      {...props}
    >
      <ComboboxPrimitive.ItemIndicator className="col-start-1">
        <svg
          aria-hidden="true"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
        </svg>
      </ComboboxPrimitive.ItemIndicator>
      <span className="col-start-2 min-w-0">{children}</span>
    </ComboboxPrimitive.Item>
  )
}

export function ComboboxPopup({
  className,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  alignItemWithTrigger = true,
  anchor,
  portalProps,
  ...props
}: ComboboxPrimitive.Popup.Props & {
  portalProps?: ComboboxPrimitive.Portal.Props
  side?: ComboboxPrimitive.Positioner.Props['side']
  sideOffset?: ComboboxPrimitive.Positioner.Props['sideOffset']
  align?: ComboboxPrimitive.Positioner.Props['align']
  alignOffset?: ComboboxPrimitive.Positioner.Props['alignOffset']
  alignItemWithTrigger?: ComboboxPrimitive.Positioner.Props['alignItemWithTrigger']
  anchor?: ComboboxPrimitive.Positioner.Props['anchor']
}): React.ReactElement {
  return (
    <ComboboxPrimitive.Portal {...portalProps}>
      <ComboboxPrimitive.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 select-none"
        data-slot="combobox-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <ComboboxPrimitive.Popup
          className="text-foreground origin-(--transform-origin) outline-none"
          data-slot="combobox-popup"
          {...props}
        >
          <ComboboxPrimitive.Arrow className="z-50" />
          <div className="bg-popover relative h-full min-w-(--anchor-width) rounded-lg border shadow-lg/5 not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]">
            {children}
          </div>
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

export { ComboboxPrimitive }
