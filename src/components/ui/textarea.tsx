import * as React from 'react'

import { cn } from '#/lib/utils.ts'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-border placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/40 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/45 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 bg-background hover:border-ring/60 focus-visible:bg-background flex field-sizing-content min-h-16 w-full rounded-lg border px-2.5 py-2 text-base shadow-sm transition-[border-color,box-shadow,background-color] duration-200 outline-none hover:shadow-md focus-visible:shadow-md focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none aria-invalid:ring-3 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
