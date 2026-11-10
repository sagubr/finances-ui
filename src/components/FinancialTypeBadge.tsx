import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export type CashFlowType = 'INCOME' | 'EXPENSE'

export const FinancialTypeBadge = ({
  type,
  className,
}: Readonly<{ type: CashFlowType; className?: string }>) => {
  const income = type === 'INCOME'
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium',
        income
          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'border-destructive/25 bg-destructive/10 text-destructive',
        className,
      )}
    >
      {income ? <ArrowUpRight /> : <ArrowDownRight />}
      {income ? 'Receita' : 'Despesa'}
    </Badge>
  )
}
