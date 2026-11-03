import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import type { HTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { useTableContext } from '../../hooks/useTableContext'

type TableRowProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
>

const TableRow = forwardRef<HTMLDivElement, TableRowProps>(
  ({ className, children, ...props }, ref) => {
    const { table } = useTableContext()

    if (!table) return null

    return (
      <motion.div
        ref={ref}
        initial={table.options.meta?.row?.disableAnimation ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'group flex w-full [:not(:last-of-type)]:border-b',
          table.options.meta?.row?.className,
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)

export default TableRow
