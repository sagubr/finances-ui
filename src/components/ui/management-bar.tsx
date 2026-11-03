'use client'

import { SlidingNumber } from '#/components/ui/sliding-number.tsx'
import { cn } from '#/lib/utils.ts'
import { Ban, ChevronLeft, ChevronRight, Command, IdCard, X } from 'lucide-react'
import type { Transition, Variants } from 'motion/react'
import { motion } from 'motion/react'
import * as React from 'react'

const TOTAL_PAGES = 10

const BUTTON_MOTION_CONFIG = {
  initial: 'rest',
  whileHover: 'hover',
  whileTap: 'tap',
  variants: {
    rest: { maxWidth: '40px' },
    hover: {
      maxWidth: '140px',
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 35,
        delay: 0.15,
      },
    },
    tap: { scale: 0.95 },
  },
  transition: { type: 'spring', stiffness: 250, damping: 25 },
} as const

const LABEL_VARIANTS: Variants = {
  rest: { opacity: 0, x: 4 },
  hover: { opacity: 1, x: 0, visibility: 'visible' },
  tap: { opacity: 1, x: 0, visibility: 'visible' },
}

const LABEL_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
}

export function ManagementBar() {
  const [currentPage, setCurrentPage] = React.useState(1)

  const handlePrevPage = React.useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }, [currentPage])

  const handleNextPage = React.useCallback(() => {
    if (currentPage < TOTAL_PAGES) setCurrentPage(currentPage + 1)
  }, [currentPage])

  return (
    <div className="flex w-full justify-center">
      <div className="bg-background flex w-fit flex-col items-center gap-2 rounded-2xl border p-2 shadow-lg sm:flex-row">
        <div className="mx-auto flex shrink-0 flex-row items-center">
          <div className="flex h-10 items-center">
            <button
              disabled={currentPage === 1}
              className="disabled:text-foreground/70/30 disabled:hover:text-foreground/70/30 text-foreground/70 hover:text-foreground cursor-pointer p-2 transition-colors"
              onClick={handlePrevPage}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="mx-2 flex items-center space-x-1 text-sm tabular-nums">
              <SlidingNumber
                className="text-foreground font-semibold"
                padStart
                number={currentPage}
              />
              <span className="text-foreground/70">/ {TOTAL_PAGES}</span>
            </div>
            <button
              disabled={currentPage === TOTAL_PAGES}
              className="disabled:text-foreground/70/30 disabled:hover:text-foreground/70/30 text-foreground/70 hover:text-foreground cursor-pointer p-2 transition-colors"
              onClick={handleNextPage}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="bg-border mx-3 hidden h-6 w-px rounded-full sm:block" />

          <motion.div layout layoutRoot className="mx-auto flex space-x-2">
            <motion.button
              {...BUTTON_MOTION_CONFIG}
              className="flex h-10 cursor-pointer items-center space-x-2 overflow-hidden rounded-lg bg-neutral-200/60 px-2.5 py-2 whitespace-nowrap text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300"
              aria-label="Blacklist"
            >
              <Ban size={18} className="shrink-0" />
              <motion.span
                variants={LABEL_VARIANTS}
                transition={LABEL_TRANSITION}
                className="invisible text-xs font-semibold"
              >
                Blacklist
              </motion.span>
            </motion.button>

            <motion.button
              {...BUTTON_MOTION_CONFIG}
              className="flex h-10 cursor-pointer items-center space-x-2 overflow-hidden rounded-lg bg-red-200/60 px-2.5 py-2 whitespace-nowrap text-red-600 dark:bg-red-900/60 dark:text-red-300"
              aria-label="Reject"
            >
              <X size={18} className="shrink-0" />
              <motion.span
                variants={LABEL_VARIANTS}
                transition={LABEL_TRANSITION}
                className="invisible text-xs font-semibold"
              >
                Reject
              </motion.span>
            </motion.button>

            <motion.button
              {...BUTTON_MOTION_CONFIG}
              className="flex h-10 cursor-pointer items-center space-x-2 overflow-hidden rounded-lg bg-green-200/60 px-2.5 py-2 whitespace-nowrap text-green-600 dark:bg-green-950/60 dark:text-green-300"
              aria-label="Hire"
            >
              <IdCard size={18} className="shrink-0" />
              <motion.span
                variants={LABEL_VARIANTS}
                transition={LABEL_TRANSITION}
                className="invisible text-xs font-semibold"
              >
                Hire
              </motion.span>
            </motion.button>
          </motion.div>
        </div>

        <div className="bg-border mx-2 hidden h-6 w-px rounded-full sm:block" />

        <motion.button
          whileTap={{ scale: 0.975 }}
          className="dark:hover:bg-teal-850 flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white transition-colors duration-300 hover:bg-teal-700 sm:w-auto dark:bg-teal-700/80"
        >
          <span className="mr-1 text-neutral-200">Move to:</span>
          <span>Interview I</span>
          <div className="mx-2 h-5 w-px rounded-full bg-white/40" />
          <div className="-mr-1 flex items-center gap-1 rounded-md bg-white/20 px-1.5 py-0.5">
            <Command size={12} />E
          </div>
        </motion.button>
      </div>
    </div>
  )
}

export function ManagementBarContainer({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'bg-background flex w-fit flex-col items-center gap-1.5 rounded-xl border p-1.5 shadow-lg sm:flex-row',
        className,
      )}
    >
      <motion.div layout layoutRoot className="mx-auto flex space-x-1.5">
        {children}
      </motion.div>
    </div>
  )
}

export const ManagementBarButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof motion.button> & {
    icon: React.ReactNode
    label: string
    active?: boolean
  }
>(({ icon, label, active, className, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      {...BUTTON_MOTION_CONFIG}
      className={cn(
        'flex h-8 cursor-pointer items-center space-x-2 overflow-hidden rounded-md px-2 py-1.5 whitespace-nowrap transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-neutral-200/60 text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300',
        className,
      )}
      aria-label={label}
      {...props}
    >
      <div className="shrink-0">{icon}</div>
      <motion.span
        variants={LABEL_VARIANTS}
        transition={LABEL_TRANSITION}
        className="invisible text-xs font-semibold"
      >
        {label}
      </motion.span>
    </motion.button>
  )
})
