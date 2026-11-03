import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'
import { useTableContext } from '../../hooks/useTableContext'

type TableLayoutProps = HTMLAttributes<HTMLDivElement>

const TableLayout = ({ children, className, style, ...props }: TableLayoutProps) => {
  const { table } = useTableContext()

  if (!table) return null

  return (
    <div
      {...props}
      className={cn('flex min-w-full flex-1 flex-col', className)}
      style={{
        width: '100%',
        minWidth: table.getTotalSize(),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export default TableLayout
