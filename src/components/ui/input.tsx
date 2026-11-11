import { Input as InputPrimitive } from '@base-ui/react/input'
import * as React from 'react'

import { cn } from '#/lib/utils.ts'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'border-border file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/45 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 bg-background hover:border-ring/60 focus-visible:bg-background h-11 w-full min-w-0 rounded-xl border px-3 py-2 text-base [color-scheme:light] shadow-sm transition-[border-color,box-shadow,background-color] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:shadow-md focus-visible:shadow-md focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none aria-invalid:ring-3 sm:h-8 sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-sm dark:[color-scheme:dark]',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
