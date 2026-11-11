'use client'

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

function Tabs({ className, orientation = 'horizontal', ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs flex gap-2 data-horizontal:flex-col', className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'group/tabs-list flex w-full items-center justify-center overflow-x-auto overscroll-x-contain rounded-xl border border-border/80 p-1 text-foreground/70 shadow-inner [scrollbar-width:none] group-data-horizontal/tabs:min-h-12 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none data-[variant=line]:border-transparent data-[variant=line]:shadow-none [&::-webkit-scrollbar]:hidden',
  {
    variants: {
      variant: {
        default: 'bg-muted/80 dark:bg-muted/50',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TabsList({
  className,
  variant = 'default',
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "text-foreground/65 hover:bg-background/70 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:text-foreground/70 dark:hover:bg-background/20 dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:border-primary/40 group-data-[variant=default]/tabs-list:data-active:ring-primary/20 relative inline-flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:shadow-sm focus-visible:ring-[3px] focus-visible:outline-1 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[variant=default]/tabs-list:data-active:-translate-y-px group-data-[variant=default]/tabs-list:data-active:font-semibold group-data-[variant=default]/tabs-list:data-active:shadow-lg group-data-[variant=default]/tabs-list:data-active:ring-1 group-data-[variant=line]/tabs-list:data-active:shadow-none group-data-[variant=line]/tabs-list:data-active:ring-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent',
        'data-active:bg-background data-active:text-primary dark:data-active:border-primary/40 dark:data-active:bg-primary/10 dark:data-active:text-primary',
        'after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, tabsListVariants, TabsTrigger }
