import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'
import { forwardRef } from 'react'

type TableContainerProps = HTMLAttributes<HTMLDivElement>

const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        className={cn(
          'relative flex w-full max-w-full min-w-0 flex-1 flex-col overflow-auto rounded-xl border shadow-md',
          className,
        )}
      >
        {children}
      </div>
    )
  },
)

export default TableContainer
