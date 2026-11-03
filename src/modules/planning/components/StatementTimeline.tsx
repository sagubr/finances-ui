import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/modules/transactions/utils/money'
import { formatDatePtBr } from '@/utils/date'
import type { Statement } from '../models/planning.types'

const monthLabel = (date: string) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' })
    .format(new Date(`${date}T12:00:00`))
    .replace('.', '')

export const StatementTimeline = ({
  statements,
  selectedId,
  currency,
  onSelect,
}: Readonly<{
  statements: readonly Statement[]
  selectedId?: string
  currency: string
  onSelect: (id: string) => void
}>) => {
  const maximum = Math.max(0, ...statements.map(({ totalCents }) => totalCents))

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Evolução das faturas</CardTitle>
        </CardHeader>
        <CardContent>
          {maximum === 0 ? (
            <p className="text-muted-foreground flex min-h-48 items-center justify-center text-sm">
              As faturas ainda não possuem valores.
            </p>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div
                className="flex h-52 min-w-max items-end gap-3 border-b px-2"
                role="img"
                aria-label="Evolução do valor das faturas"
              >
                {statements.map((statement) => {
                  const height = Math.max(4, (statement.totalCents / maximum) * 100)
                  return (
                    <button
                      key={statement.id}
                      type="button"
                      className="group flex h-full w-16 shrink-0 flex-col items-center justify-end gap-2"
                      onClick={() => onSelect(statement.id)}
                      title={`${monthLabel(statement.dueOn)}: ${formatMoney(statement.totalCents, currency)}`}
                    >
                      <span
                        className={cn(
                          'bg-primary/55 group-hover:bg-primary w-7 rounded-t transition-all',
                          selectedId === statement.id && 'bg-primary',
                        )}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-muted-foreground text-[10px] capitalize">
                        {monthLabel(statement.dueOn)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Linha do tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
            {statements.map((statement) => (
              <button
                key={statement.id}
                type="button"
                className={cn(
                  'hover:bg-muted flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors',
                  selectedId === statement.id && 'border-primary bg-primary/5',
                )}
                onClick={() => onSelect(statement.id)}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium capitalize">
                    {monthLabel(statement.dueOn)}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    Vence {formatDatePtBr(statement.dueOn)}
                  </span>
                </span>
                <strong className="shrink-0 text-sm">
                  {formatMoney(statement.totalCents, currency)}
                </strong>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
