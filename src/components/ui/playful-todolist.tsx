'use client'

import { Checkbox } from '#/components/ui/checkbox.tsx'
import { Label } from '#/components/ui/label.tsx'
import { cn } from '#/lib/utils.ts'
import type { Transition } from 'motion/react'
import { motion } from 'motion/react'
import * as React from 'react'

const checkboxItems = [
  {
    id: 1,
    label: 'Code in Assembly 💾',
    defaultChecked: false,
  },
  {
    id: 2,
    label: 'Present a bug as a feature 🪲',
    defaultChecked: false,
  },
  {
    id: 3,
    label: 'Push to prod on a Friday 🚀',
    defaultChecked: false,
  },
]

const getPathAnimate = (isChecked: boolean) => ({
  pathLength: isChecked ? 1 : 0,
  opacity: isChecked ? 1 : 0,
})

const getPathTransition = (isChecked: boolean): Transition => ({
  pathLength: { duration: 0.8, ease: 'easeInOut' },
  opacity: {
    duration: 0.01,
    delay: isChecked ? 0 : 0.8,
  },
})

type PlayfulCheckboxProps = Readonly<{
  id: string
  label: React.ReactNode
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  labelClassName?: string
}>

export function PlayfulCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  disabled,
  className,
  labelClassName,
}: PlayfulCheckboxProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="size-5"
      />
      <div className="relative min-w-0 flex-1">
        <Label
          htmlFor={id}
          className={cn(
            'text-foreground block cursor-pointer truncate text-sm font-medium select-none',
            disabled && 'cursor-default',
            labelClassName,
          )}
        >
          {label}
        </Label>
        <motion.svg
          width="340"
          height="32"
          viewBox="0 0 340 32"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-0 z-20 h-8 w-full -translate-y-1/2"
        >
          <motion.path
            d="M 10 16.91 s 79.8 -11.36 98.1 -11.34 c 22.2 0.02 -47.82 14.25 -33.39 22.02 c 12.61 6.77 124.18 -27.98 133.31 -17.28 c 7.52 8.38 -26.8 20.02 4.61 22.05 c 24.55 1.93 113.37 -20.36 113.37 -20.36"
            vectorEffect="non-scaling-stroke"
            strokeWidth={2}
            strokeLinecap="round"
            strokeMiterlimit={10}
            fill="none"
            initial={false}
            animate={getPathAnimate(checked)}
            transition={getPathTransition(checked)}
            className="stroke-foreground"
          />
        </motion.svg>
      </div>
    </div>
  )
}

export function PlayfulTodolist() {
  const [checked, setChecked] = React.useState(checkboxItems.map((i) => !!i.defaultChecked))

  return (
    <div className="w-full max-w-sm space-y-4 rounded-2xl bg-neutral-100 p-6 dark:bg-neutral-900">
      {checkboxItems.map((item, idx) => (
        <div key={item.id} className="space-y-4">
          <PlayfulCheckbox
            id={`checkbox-${item.id}`}
            label={item.label}
            checked={!!checked[idx]}
            onCheckedChange={(val) => {
              const updated = [...checked]
              updated[idx] = val
              setChecked(updated)
            }}
          />
          {idx !== checkboxItems.length - 1 && (
            <div className="border-t border-neutral-200 dark:border-neutral-800" />
          )}
        </div>
      ))}
    </div>
  )
}
