'use client'

import { cn } from '#/lib/utils.ts'
import { Avatar } from '@base-ui/react/avatar'
import { Button } from '@base-ui/react/button'
import { ArrowRight } from 'lucide-react'
import { motion, MotionConfig } from 'motion/react'

interface NativeUserCardProps {
  imageSrc: string
  name: string
  handle: string
  href?: string
  onClick?: () => void
  className?: string
}

const transition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
}

export function NativeUserCard({
  imageSrc,
  name,
  handle,
  href = '#',
  onClick,
  className,
}: NativeUserCardProps) {
  const CardContent = (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={{
        initial: { opacity: 0, scale: 0.98, y: 5 },
        animate: { opacity: 1, scale: 1, y: 0 },
      }}
      transition={transition}
      className={cn(
        'group border-border bg-card relative flex w-full max-w-full items-center justify-between gap-4 rounded-lg border p-1 transition-all duration-300',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg sm:h-12 sm:w-12">
          <Avatar.Root className="h-full w-full rounded-lg">
            <Avatar.Image src={imageSrc} alt={name} className="h-full w-full object-cover" />
            <Avatar.Fallback className="bg-muted text-foreground/70 flex h-full w-full items-center justify-center font-semibold">
              {name.charAt(0)}
            </Avatar.Fallback>
          </Avatar.Root>
        </div>

        <div className="flex min-w-0 flex-col">
          <h3 className="text-foreground truncate text-sm leading-none font-semibold tracking-tight">
            {name}
          </h3>
          <p className="text-foreground/70 truncate text-xs font-medium">{handle}</p>
        </div>
      </div>

      <div className="relative shrink-0 pl-2">
        <Button
          className={cn(
            'bg-primary text-primary-foreground flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg opacity-100 transition-transform duration-300 sm:h-12 sm:w-12',
            'focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          )}
        >
          <motion.div whileTap={{ scale: 0.95 }}>
            <motion.span
              className="inline-block"
              variants={{
                hover: { x: 3 },
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
            >
              <ArrowRight className="h-3 w-3" />
            </motion.span>
          </motion.div>
        </Button>
      </div>
    </motion.div>
  )

  return (
    <MotionConfig transition={transition}>
      {onClick ? (
        <Button
          onClick={onClick}
          className="focus-visible:ring-ring block h-auto w-full max-w-full rounded-lg p-0 text-left outline-none hover:bg-transparent focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label={`View profile of ${name}`}
        >
          {CardContent}
        </Button>
      ) : (
        <a
          href={href}
          className="focus-visible:ring-ring block w-full max-w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label={`View profile of ${name}`}
        >
          {CardContent}
        </a>
      )}
    </MotionConfig>
  )
}
