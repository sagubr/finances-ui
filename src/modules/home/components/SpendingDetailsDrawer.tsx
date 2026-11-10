import { ResourceErrorState } from '@/components/ResourceErrorState'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Skeleton } from '@/components/ui/skeleton'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type {
  Transaction,
  TransactionFilters,
} from '@/modules/transactions/models/transaction.types'
import { transactionsQueryOptions } from '@/modules/transactions/queries/transaction.queries'
import { formatMoney } from '@/modules/transactions/utils/money'
import { useInfiniteQuery } from '@tanstack/react-query'
import { CalendarClock, ReceiptText } from 'lucide-react'
import { memo, useMemo } from 'react'

const statusLabels = {
  PLANNED: 'Planejado',
  CONFIRMED: 'Confirmado',
  SETTLED: 'Liquidado',
} satisfies Record<Transaction['status'], string>

type SpendingDetailFilters = Pick<TransactionFilters, 'date' | 'categoryId'>

const SpendingList = memo(function SpendingList({
  month,
  currency,
  filters,
}: Readonly<{
  month: string
  currency: string
  filters: SpendingDetailFilters
}>) {
  const transactions = useInfiniteQuery(transactionsQueryOptions({ month, ...filters, limit: 100 }))
  const expenses = useMemo(
    () =>
      (transactions.data?.pages.flatMap((page) => page.items) ?? []).filter(
        (transaction) =>
          transaction.categoryId !== null &&
          (transaction.type === 'EXPENSE' || transaction.type === 'CARD_PAYMENT'),
      ),
    [transactions.data],
  )

  if (transactions.isPending)
    return (
      <div className="space-y-3 p-4" aria-label="Carregando gastos">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-16 rounded-xl" />
        ))}
      </div>
    )

  if (transactions.isError)
    return (
      <div className="p-4">
        <ResourceErrorState
          compact
          title="Não foi possível carregar os gastos"
          error={transactions.error}
          fallbackMessage="Tente carregar os lançamentos novamente."
          onRetry={() => void transactions.refetch()}
          isRetrying={transactions.isFetching}
        />
      </div>
    )

  if (expenses.length === 0)
    return (
      <div className="text-muted-foreground flex min-h-48 flex-col items-center justify-center gap-2 px-6 text-center">
        <ReceiptText className="size-6" />
        <p className="text-sm">Nenhum gasto encontrado.</p>
      </div>
    )

  return (
    <div className="min-h-0 overflow-y-auto p-4">
      <ul className="divide-y" aria-label="Gastos">
        {expenses.map((transaction) => (
          <li key={transaction.id} className="flex items-center gap-3 py-3 first:pt-0">
            <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
              {transaction.status === 'PLANNED' ? (
                <CalendarClock className="size-4" />
              ) : (
                <ReceiptText className="size-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{transaction.description}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {statusLabels[transaction.status]}
              </p>
            </div>
            <span className="text-sm font-semibold tabular-nums">
              {formatMoney(transaction.amountCents, currency)}
            </span>
          </li>
        ))}
      </ul>
      {transactions.hasNextPage && (
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          disabled={transactions.isFetchingNextPage}
          onClick={() => void transactions.fetchNextPage()}
        >
          {transactions.isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
        </Button>
      )}
    </div>
  )
})

export const SpendingDetailsDrawer = memo(function SpendingDetailsDrawer({
  open,
  onOpenChange,
  month,
  currency,
  title,
  description,
  filters,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
  month: string
  currency: string
  title: string
  description: string
  filters: SpendingDetailFilters
}>) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={isDesktop ? 'right' : 'down'}
      showSwipeHandle={!isDesktop}
    >
      <DrawerContent className="md:[--drawer-content-width:28rem]">
        {open && (
          <>
            <DrawerHeader>
              <DrawerTitle className="capitalize">{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>
            <SpendingList month={month} currency={currency} filters={filters} />
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
})
