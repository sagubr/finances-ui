'use client'

import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { Facebook, Github, Share2, X } from 'lucide-react'
import type { HTMLMotionProps } from 'motion/react'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'

import { cn } from '#/lib/utils.ts'

const shareButtonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: {
        default: 'h-10 min-w-[112px] px-4 py-2',
        sm: 'h-9 min-w-[96px] gap-1.5 rounded-md px-3',
        md: 'h-10 min-w-[112px] px-4 py-2',
        lg: 'h-11 min-w-[128px] px-8',
      },
      icon: {
        suffix: 'pl-4',
        prefix: 'pr-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const iconSizeMap = {
  sm: 16,
  md: 20,
  lg: 28,
  default: 16,
}

type ShareButtonProps = HTMLMotionProps<'button'> & {
  children: React.ReactNode
  className?: string
  onIconClick?: (platform: 'github' | 'x' | 'facebook') => void
} & VariantProps<typeof shareButtonVariants>

function ShareButton({ children, className, size, icon, onIconClick, ...props }: ShareButtonProps) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <motion.button
      className={cn(
        'bg-primary text-primary-foreground hover:bg-primary/90',
        shareButtonVariants({ size, className, icon }),
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      <AnimatePresence initial={false} mode="wait">
        {!hovered ? (
          <motion.div
            key="content"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center gap-2"
          >
            {icon === 'prefix' && (
              <Share2
                className="size-4"
                size={iconSizeMap[size as keyof typeof iconSizeMap] || 16}
              />
            )}
            {children}
            {icon === 'suffix' && (
              <Share2
                className="size-4"
                size={iconSizeMap[size as keyof typeof iconSizeMap] || 16}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="icons"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center gap-2"
          >
            <ShareIconGroup size={size} onIconClick={onIconClick} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

const shareIconGroupVariants = cva('flex items-center justify-center gap-3', {
  variants: {
    size: {
      default: 'text-[16px]',
      sm: 'text-[16px]',
      md: 'text-[20px]',
      lg: 'text-[28px]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

type ShareIconGroupProps = HTMLMotionProps<'div'> & {
  className?: string
  onIconClick?: (
    platform: 'github' | 'x' | 'facebook',
    event: React.MouseEvent<HTMLDivElement>,
  ) => void
} & VariantProps<typeof shareIconGroupVariants>

function ShareIconGroup({ size = 'default', className, onIconClick }: ShareIconGroupProps) {
  const iconSize = iconSizeMap[size as keyof typeof iconSizeMap] || 16

  const handleIconClick = React.useCallback(
    (platform: 'github' | 'x' | 'facebook', event: React.MouseEvent<HTMLDivElement>) => {
      onIconClick?.(platform, event)
    },
    [onIconClick],
  )

  return (
    <motion.div className={cn(shareIconGroupVariants({ size }), 'group', className)}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0,
          duration: 0.5,
          type: 'spring',
          bounce: 0.4,
        }}
        whileHover={{
          y: -8,
          transition: { duration: 0.2, ease: 'easeOut' },
        }}
        className="box-border cursor-pointer rounded-lg py-3 group-hover:opacity-100"
        onClick={(event) => handleIconClick('github', event)}
      >
        <Github size={iconSize} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.1,
          duration: 0.5,
          type: 'spring',
          bounce: 0.4,
        }}
        whileHover={{
          y: -8,
          transition: { duration: 0.2, ease: 'easeOut' },
        }}
        className="box-border cursor-pointer rounded-lg py-3 group-hover:opacity-100"
        onClick={(event) => handleIconClick('x', event)}
      >
        <X size={iconSize} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.2,
          duration: 0.5,
          type: 'spring',
          bounce: 0.4,
        }}
        whileHover={{
          y: -8,
          transition: { duration: 0.2, ease: 'easeOut' },
        }}
        className="box-border cursor-pointer rounded-lg py-3 group-hover:opacity-100"
        onClick={(event) => handleIconClick('facebook', event)}
      >
        <Facebook size={iconSize} />
      </motion.div>
    </motion.div>
  )
}

export { ShareButton, type ShareButtonProps }
