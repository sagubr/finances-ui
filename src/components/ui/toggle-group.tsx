'use client'

import { getStrictContext } from '#/lib/get-strict-context.ts'
import { cn } from '#/lib/utils.ts'
import { Toggle as BaseToggle } from '@base-ui/react/toggle'
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group'
import { cva } from 'class-variance-authority'
import { motion } from 'motion/react'
import * as React from 'react'

// Context to share variants with individual Toggles
const [ToggleGroupProvider, useToggleGroup] = getStrictContext<{
  variant: 'default' | 'outline' | null | undefined
  size: 'default' | 'sm' | 'xs' | null | undefined
  value: string
  onChange: (val: string) => void
}>('ToggleGroupContext')

const toggleVariants = cva(
  'relative inline-flex items-center justify-center font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-transparent text-foreground/70 hover:bg-muted hover:text-foreground data-pressed:text-primary',
        outline:
          'border border-transparent bg-transparent hover:bg-muted hover:text-foreground data-pressed:text-primary',
      },
      size: {
        default: 'h-8 rounded-md px-3 text-sm',
        sm: 'h-7 rounded-md px-2.5 text-xs',
        xs: 'h-6 rounded-sm px-2 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface ToggleGroupProps {
  value: string
  onValueChange: (val: string) => void
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'xs'
  className?: string
  children: React.ReactNode
}

function ToggleGroup({
  value,
  onValueChange,
  variant = 'default',
  size = 'default',
  className,
  children,
  ...props
}: ToggleGroupProps) {
  const handleValueChange = (newVal: string[]) => {
    if (newVal.length > 0) {
      onValueChange(newVal[0])
    }
  }

  return (
    <BaseToggleGroup
      value={[value]}
      onValueChange={handleValueChange}
      className={cn(
        'border-border/40 bg-muted/65 relative flex w-fit items-center rounded-lg border p-1 select-none',
        variant === 'outline' && 'border p-0.5 shadow-xs',
        className,
      )}
      {...props}
    >
      <ToggleGroupProvider
        value={{
          variant,
          size,
          value,
          onChange: onValueChange,
        }}
      >
        {children}
      </ToggleGroupProvider>
    </BaseToggleGroup>
  )
}

interface ToggleProps {
  value: string
  className?: string
  children: React.ReactNode
  title?: string
}

function Toggle({ value, className, children, title, ...props }: ToggleProps) {
  const context = useToggleGroup()
  const isSelected = context.value === value

  return (
    <BaseToggle
      value={value}
      className={cn(
        toggleVariants({
          variant: context.variant,
          size: context.size,
        }),
        'relative z-10 h-8 w-8 min-w-0 flex-1 shrink-0 cursor-pointer rounded-md border-0 p-1.5 shadow-none select-none focus:z-10 focus-visible:z-10',
        isSelected ? 'text-primary' : 'text-foreground/70 hover:text-foreground',
        className,
      )}
      title={title}
      {...props}
    >
      {/* Sliding backdrop animated via layoutId */}
      {isSelected && (
        <motion.div
          layoutId="toggle-group-highlight"
          className="border-border/20 bg-background absolute inset-0 z-[-1] rounded-md border shadow-xs"
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />
      )}
      {children}
    </BaseToggle>
  )
}

export { Toggle, ToggleGroup }
