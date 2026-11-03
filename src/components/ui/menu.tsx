'use client'

import { cn } from '#/lib/utils.ts'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react'
import * as React from 'react'

type MenuProps = MenuPrimitive.Root.Props
function Menu(props: MenuProps) {
  return <MenuPrimitive.Root {...props} />
}

type MenuTriggerProps = MenuPrimitive.Trigger.Props
function MenuTrigger(props: MenuTriggerProps) {
  return <MenuPrimitive.Trigger {...props} />
}

type MenuPortalProps = MenuPrimitive.Portal.Props
function MenuPortal(props: MenuPortalProps) {
  return <MenuPrimitive.Portal {...props} />
}

type MenuPanelProps = MenuPrimitive.Popup.Props & MenuPrimitive.Positioner.Props
function MenuPanel({ className, id, children, sideOffset = 4, ...props }: MenuPanelProps) {
  return (
    <MenuPortal>
      <MenuPrimitive.Positioner className="z-50" sideOffset={sideOffset} {...props}>
        <MenuPrimitive.Popup
          id={id}
          className={cn(
            'bg-popover text-popover-foreground max-h-[var(--available-height)] min-w-[8rem] origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md outline-none',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            className,
          )}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPortal>
  )
}

type MenuGroupProps = MenuPrimitive.Group.Props
function MenuGroup(props: MenuGroupProps) {
  return <MenuPrimitive.Group {...props} />
}

type MenuGroupLabelProps = MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}
function MenuGroupLabel({ className, inset, ...props }: MenuGroupLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      data-inset={inset}
      className={cn('px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', className)}
      {...props}
    />
  )
}

type MenuItemProps = MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: 'default' | 'destructive'
}
function MenuItem({ className, inset, variant = 'default', disabled, ...props }: MenuItemProps) {
  return (
    <MenuPrimitive.Item
      disabled={disabled}
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive [&_svg:not([class*='text-'])]:text-foreground/70 data-[variant=destructive]:*:[svg]:!text-destructive relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

type MenuCheckboxItemProps = MenuPrimitive.CheckboxItem.Props
function MenuCheckboxItem({
  className,
  children,
  checked,
  disabled,
  ...props
}: MenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      disabled={disabled}
      checked={checked}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon className="size-4" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

type MenuRadioGroupProps = MenuPrimitive.RadioGroup.Props
function MenuRadioGroup(props: MenuRadioGroupProps) {
  return <MenuPrimitive.RadioGroup {...props} />
}

type MenuRadioItemProps = MenuPrimitive.RadioItem.Props
function MenuRadioItem({ className, children, disabled, ...props }: MenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      disabled={disabled}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenuPrimitive.RadioItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

type MenuSeparatorProps = MenuPrimitive.Separator.Props
function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return (
    <MenuPrimitive.Separator className={cn('bg-border -mx-1 my-1 h-px', className)} {...props} />
  )
}

function MenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('text-foreground/70 ml-auto text-xs tracking-widest', className)}
      {...props}
    />
  )
}

type MenuArrowProps = MenuPrimitive.Arrow.Props
function MenuArrow(props: MenuArrowProps) {
  return <MenuPrimitive.Arrow {...props} />
}

type MenuSubmenuProps = MenuPrimitive.SubmenuRoot.Props
function MenuSubmenu(props: MenuSubmenuProps) {
  return <MenuPrimitive.SubmenuRoot {...props} />
}

type MenuSubmenuTriggerProps = MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}
function MenuSubmenuTrigger({
  disabled,
  className,
  inset,
  children,
  ...props
}: MenuSubmenuTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      disabled={disabled}
      data-inset={inset}
      className={cn(
        'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors select-none data-[inset]:pl-8',
        '[&_[data-slot=chevron]]:transition-transform [&_[data-slot=chevron]]:duration-300 [&_[data-slot=chevron]]:ease-in-out aria-[expanded=true]:[&_[data-slot=chevron]]:rotate-90',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon data-slot="chevron" className="ml-auto size-4" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

type MenuSubmenuPanelProps = MenuPrimitive.Popup.Props & MenuPrimitive.Positioner.Props
function MenuSubmenuPanel({
  className,
  id,
  children,
  sideOffset = 4,
  ...props
}: MenuSubmenuPanelProps) {
  return (
    <MenuPortal>
      <MenuPrimitive.Positioner className="z-50" sideOffset={sideOffset} {...props}>
        <MenuPrimitive.Popup
          id={id}
          className={cn(
            'bg-popover text-popover-foreground max-h-[var(--available-height)] min-w-[8rem] origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            className,
          )}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPortal>
  )
}

export {
  Menu,
  MenuArrow,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPanel,
  MenuPortal,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSubmenu,
  MenuSubmenuPanel,
  MenuSubmenuTrigger,
  MenuTrigger,
  type MenuArrowProps,
  type MenuCheckboxItemProps,
  type MenuGroupLabelProps,
  type MenuGroupProps,
  type MenuItemProps,
  type MenuPanelProps,
  type MenuPortalProps,
  type MenuProps,
  type MenuRadioGroupProps,
  type MenuRadioItemProps,
  type MenuSeparatorProps,
  type MenuSubmenuPanelProps,
  type MenuSubmenuProps,
  type MenuSubmenuTriggerProps,
  type MenuTriggerProps,
}
