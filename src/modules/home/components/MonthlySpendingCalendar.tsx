import { ResourceErrorState } from '@/components/ResourceErrorState'
import { Button } from '@/components/ui/button'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Skeleton } from '@/components/ui/skeleton'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { setCompetenceMonth } from '@/modules/competence/store/competence.store'
import type { MonthlyCalendar } from '@/modules/reports/models/report.types'
import { monthlyCalendarQuery } from '@/modules/reports/queries/report.queries'
import type { Transaction } from '@/modules/transactions/models/transaction.types'
import { transactionsQueryOptions } from '@/modules/transactions/queries/transaction.queries'
import { formatMoney } from '@/modules/transactions/utils/money'
import { parseCivilDate, toCivilDate } from '@/utils/date'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { ptBR } from 'date-fns/locale'
import { CalendarClock, ReceiptText } from 'lucide-react'
import { createContext, memo, useContext, useMemo, useState } from 'react'
import type { DayButtonProps } from 'react-day-picker'

type CalendarDaySummary = MonthlyCalendar['items'][number] & {
  realizedCompact: string
  plannedCompact: string
  ariaDescription: string
}

const DaySummaryContext = createContext<ReadonlyMap<string, CalendarDaySummary>>(new Map())
const compactNumber = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const dayTitleFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const SpendingDayButtonContent = memo(function SpendingDayButtonContent({
  day,
  className,
  ...props
}: DayButtonProps) {
  const summaries = useContext(DaySummaryContext)
  const summary = summaries.get(toCivilDate(day.date))
  const ariaLabel = summary
    ? `${props['aria-label'] ?? day.date.getDate()}. ${summary.ariaDescription}`
    : props['aria-label']

  return (
    <CalendarDayButton
      day={day}
      className={`${className ?? ''} hover:border-border hover:bg-accent in-data-selected:border-primary/50 in-data-selected:bg-primary/10 in-data-selected:text-foreground in-data-selected:hover:bg-primary/15 h-16 w-full flex-col items-center justify-start gap-0.5 rounded-lg border border-transparent px-0.5 py-1 text-center hover:rounded-lg in-data-selected:rounded-lg sm:h-[4.5rem]`}
      {...props}
      aria-label={ariaLabel}
    >
      <span className="flex h-5 shrink-0 items-start justify-center text-xs font-medium sm:text-sm">
        {day.date.getDate()}
      </span>
      {summary?.realizedExpenseCents ? (
        <span className="text-destructive max-w-full truncate text-[9px] leading-tight font-medium sm:text-[10px]">
          {summary.realizedCompact}
        </span>
      ) : null}
      {summary?.plannedExpenseCents ? (
        <span className="text-muted-foreground max-w-full truncate text-[9px] leading-tight sm:text-[10px]">
          {summary.plannedCompact}
        </span>
      ) : null}
    </CalendarDayButton>
  )
})

function SpendingDayButton(props: DayButtonProps) {
  return <SpendingDayButtonContent {...props} />
}

const statusLabels = {
  PLANNED: 'Planejado',
  CONFIRMED: 'Confirmado',
  SETTLED: 'Liquidado',
} satisfies Record<Transaction['status'], string>

const DayExpenses = memo(function DayExpenses({
  date,
  month,
  currency,
}: Readonly<{ date: string; month: string; currency: string }>) {
  const transactions = useInfiniteQuery(transactionsQueryOptions({ month, date, limit: 100 }))
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
      <div className="space-y-3 p-4" aria-label="Carregando gastos do dia">
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
          fallbackMessage="Tente carregar os lançamentos deste dia novamente."
          onRetry={() => void transactions.refetch()}
          isRetrying={transactions.isFetching}
        />
      </div>
    )

  if (expenses.length === 0)
    return (
      <div className="text-muted-foreground flex min-h-48 flex-col items-center justify-center gap-2 px-6 text-center">
        <ReceiptText className="size-6" />
        <p className="text-sm">Nenhum gasto registrado neste dia.</p>
      </div>
    )

  return (
    <div className="min-h-0 overflow-y-auto p-4">
      <ul className="divide-y" aria-label="Gastos do dia">
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

export const MonthlySpendingCalendar = memo(function MonthlySpendingCalendar({
  month,
  currency,
}: Readonly<{ month: string; currency: string }>) {
  const calendar = useQuery(monthlyCalendarQuery(month))
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const calendarMonth = useMemo(
    () => new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1, 12),
    [month],
  )
  const selectedDay = useMemo(
    () => (selectedDate ? parseCivilDate(selectedDate) : undefined),
    [selectedDate],
  )
  const summaries = useMemo(
    () =>
      new Map(
        (calendar.data?.items ?? []).map((item) => [
          item.date,
          {
            ...item,
            realizedCompact: compactNumber.format(item.realizedExpenseCents / 100),
            plannedCompact: compactNumber.format(item.plannedExpenseCents / 100),
            ariaDescription: `Gastos realizados: ${formatMoney(item.realizedExpenseCents, currency)}. Gastos planejados: ${formatMoney(item.plannedExpenseCents, currency)}.`,
          },
        ]),
      ),
    [calendar.data?.items, currency],
  )

  return (
    <>
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Gastos por dia</CardTitle>
          <CardDescription>
            Selecione um dia para ver o realizado e o que ainda está planejado.
          </CardDescription>
          <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="bg-destructive size-2 rounded-full" /> Realizado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-muted-foreground size-2 rounded-full" /> Planejado
            </span>
          </div>
        </CardHeader>
        <CardContent className="min-w-0">
          {calendar.isPending ? (
            <Skeleton className="h-[22rem] w-full rounded-xl" />
          ) : calendar.isError ? (
            <ResourceErrorState
              compact
              title="Não foi possível carregar o calendário"
              error={calendar.error}
              fallbackMessage="Tente carregar os gastos da competência novamente."
              onRetry={() => void calendar.refetch()}
              isRetrying={calendar.isFetching}
            />
          ) : (
            <DaySummaryContext.Provider value={summaries}>
              <Calendar
                mode="single"
                month={calendarMonth}
                selected={selectedDay}
                locale={ptBR}
                showOutsideDays={false}
                onDayClick={(date) => setSelectedDate(toCivilDate(date))}
                onMonthChange={(date) =>
                  setCompetenceMonth(
                    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                  )
                }
                components={{ DayButton: SpendingDayButton }}
                className="w-full [--cell-size:--spacing(10)]"
                classNames={{
                  month: 'w-full',
                  month_grid: 'w-full table-fixed border-collapse',
                  weekdays: 'table-row',
                  weekday: 'w-[14.285%] p-0 text-center',
                  weeks: 'table-row-group',
                  week: 'table-row',
                  day: 'h-16 w-[14.285%] p-0.5 align-top sm:h-[4.5rem]',
                  day_button: 'h-full w-full',
                }}
              />
            </DaySummaryContext.Provider>
          )}
        </CardContent>
      </Card>
      <Drawer
        open={selectedDate !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDate(null)
        }}
        swipeDirection={isDesktop ? 'right' : 'down'}
        showSwipeHandle={!isDesktop}
      >
        <DrawerContent className="md:[--drawer-content-width:28rem]">
          {selectedDate && (
            <>
              <DrawerHeader>
                <DrawerTitle className="capitalize">
                  {dayTitleFormatter.format(parseCivilDate(selectedDate))}
                </DrawerTitle>
                <DrawerDescription>Gastos realizados e planejados para o dia.</DrawerDescription>
              </DrawerHeader>
              <DayExpenses date={selectedDate} month={month} currency={currency} />
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
})
