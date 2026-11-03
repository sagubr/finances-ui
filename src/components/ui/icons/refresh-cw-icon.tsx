'use client'

import { motion, useAnimation } from 'motion/react'
import type { HTMLAttributes } from 'react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'

import { cn } from '@/lib/utils'

export interface RefreshCWIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

interface RefreshCWIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  isLoading?: boolean
}

const RefreshCWIcon = forwardRef<RefreshCWIconHandle, RefreshCWIconProps>(
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
        if (isControlledRef.current) onMouseEnter?.(e)
        else controls.start('animate')
      },
      [controls, onMouseEnter, isLoading],
    )

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isLoading) return
        if (isControlledRef.current) onMouseLeave?.(e)
        else controls.start('normal')
      },
      [controls, onMouseLeave, isLoading],
    )

    return (
      <div
        className={cn('flex cursor-pointer items-center justify-center', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          variants={{
            normal: {
              rotate: '0deg',
              transition: {
                type: 'spring',
                stiffness: 250,
                damping: 25,
              },
            },
            animate: {
              rotate: '50deg',
              transition: {
                type: 'spring',
                stiffness: 250,
                damping: 25,
              },
            },
            loading: {
              rotate: '360deg',
              transition: {
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              },
            },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </motion.svg>
      </div>
    )
  },
)

RefreshCWIcon.displayName = 'RefreshCWIcon'

export { RefreshCWIcon }
