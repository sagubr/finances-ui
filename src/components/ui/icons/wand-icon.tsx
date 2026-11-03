'use client'

import type { Variants } from 'motion/react'
import { motion, useAnimation } from 'motion/react'
import type { HTMLAttributes } from 'react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'

import { cn } from '@/lib/utils'

export interface WandIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

interface WandIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  isLoading?: boolean
}

const WAND_VARIANTS: Variants = {
  normal: { rotate: 0, originX: '2px', originY: '22px' },
  animate: {
    rotate: [0, -15, 10, -5, 0],
    originX: '2px',
    originY: '22px',
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
  loading: {
    rotate: [0, -20, 20, 0],
    originX: '2px',
    originY: '22px',
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
}

const SPARKLE_VARIANTS: Variants = {
  normal: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.5, 0.8, 1.2, 1],
    opacity: [1, 0.5, 1],
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
  loading: {
    scale: [1, 1.3, 0.8, 1],
    opacity: [1, 0.6, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
}

const WandIcon = forwardRef<WandIconHandle, WandIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, isLoading, ...props }, ref) => {
    const controls = useAnimation()
    const isControlledRef = useRef(false)

    useEffect(() => {
      if (isLoading) {
        controls.start('loading')
      } else {
        controls.start('normal')
      }
    }, [isLoading, controls])

    useImperativeHandle(ref, () => {
      isControlledRef.current = true

      return {
        startAnimation: () => controls.start('animate'),
        stopAnimation: () => controls.start('normal'),
      }
    })

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isLoading) return
        if (isControlledRef.current) {
          onMouseEnter?.(e)
        } else {
          controls.start('animate')
        }
      },
      [controls, onMouseEnter, isLoading],
    )

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isLoading) return
        if (isControlledRef.current) {
          onMouseLeave?.(e)
        } else {
          controls.start('normal')
        }
      },
      [controls, onMouseLeave, isLoading],
    )

    return (
      <div
        className={cn('flex items-center justify-center', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Wand Stick */}
          <motion.g animate={controls} variants={WAND_VARIANTS}>
            <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
            <path d="m14 7 3 3" />
          </motion.g>

          {/* Sparkles */}
          <motion.g
            animate={controls}
            variants={SPARKLE_VARIANTS}
            style={{ originX: '12px', originY: '12px' }}
          >
            <path d="M5 6v4" />
            <path d="M19 14v4" />
            <path d="M10 2v2" />
            <path d="M7 8H3" />
            <path d="M21 16h-4" />
            <path d="M11 3H9" />
          </motion.g>
        </svg>
      </div>
    )
  },
)

WandIcon.displayName = 'WandIcon'

export { WandIcon }
