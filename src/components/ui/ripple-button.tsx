'use client'

import { buttonVariants } from '#/components/ui/button.tsx'
import { cn } from '#/lib/utils.ts'
import type { VariantProps } from 'class-variance-authority'
import { motion } from 'motion/react'
import * as React from 'react'

export interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  rippleColor?: string
  duration?: number
}

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      rippleColor = 'rgba(255, 255, 255, 0.35)',
      duration = 600,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [ripples, setRipples] = React.useState<Ripple[]>([])

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget
      const rect = button.getBoundingClientRect()

      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const maxDim = Math.max(rect.width, rect.height)
      const rippleSize = maxDim * 2.5

      const newRipple = {
        id: Date.now() + Math.random(),
        x,
        y,
        size: rippleSize,
      }

      setRipples((prev) => [...prev, newRipple])

      if (onClick) onClick(event)
    }

    React.useEffect(() => {
      if (ripples.length === 0) return
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1))
      }, duration)
      return () => clearTimeout(timer)
    }, [ripples, duration])

    // Detect if theme requires a dark/light ripple color if not explicitly defined
    const resolvedRippleColor = React.useMemo(() => {
      if (rippleColor !== 'rgba(255, 255, 255, 0.35)') return rippleColor
      if (variant === 'outline' || variant === 'ghost' || variant === 'secondary') {
        return 'rgba(0, 0, 0, 0.1)'
      }
      return rippleColor
    }, [rippleColor, variant])

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          buttonVariants({ variant, size, className }),
          'relative cursor-pointer overflow-hidden select-none',
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-1.5">{children}</span>
        <span className="pointer-events-none absolute inset-0 z-0">
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={{
                duration: duration / 1000,
                ease: 'easeOut',
              }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                backgroundColor: resolvedRippleColor,
              }}
            />
          ))}
        </span>
      </button>
    )
  },
)

RippleButton.displayName = 'RippleButton'
export type RippleButtonRipplesProps = {
  className?: string
}
export function RippleButtonRipples(_props: RippleButtonRipplesProps) {
  return null // kept for compatibility if needed
}
