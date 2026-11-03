import { LoaderIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Carregando"
      className={cn('size-4 animate-spin text-current', className)}
      {...props}
    />
  )
}

export { Spinner }
