import { envConfig } from '@/config/env.config'
import { cn } from '@/lib/utils'
import React from 'react'

interface VersionBadgeProps {
  className?: string
  align?: 'center' | 'left'
}

export const VersionBadge: React.FC<VersionBadgeProps> = ({ className, align = 'center' }) => {
  const version = envConfig.version

  return (
    <div
      className={cn(
        'text-foreground/70 flex flex-col gap-1 text-xs',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      <span className="text-muted-foreground text-[10px] font-medium tracking-tight">
        v{version}
      </span>
    </div>
  )
}
