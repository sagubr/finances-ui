import { ApiClientError } from '@/api/api-client.error'
import Table from '@/components/Table'
import { civilDateColumn } from '@/components/Table/columns/date.columns'
import { TooltipButton } from '@/components/TooltipButton'
import type { ViewMode } from '@/components/ViewModeToggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Spinner } from '@/components/ui/spinner'
import {
  getActiveWorkspaceRole,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { formatCompetencePtBr, formatDatePtBr } from '@/utils/date'
import { useStore } from '@tanstack/react-store'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Check,
  CircleDollarSign,
  HandCoins,
  Pencil,
  ReceiptText,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Transaction } from '../models/transaction.types'
import { useTransactionAction } from '../queries/transaction.queries'
import { formatMoney } from '../utils/money'

type TransactionListProps = Readonly<{
  transactions: readonly Transaction[]
  isLoading: boolean
  error: Error | null
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  viewMode: ViewMode
  onEdit: (transaction: Transaction) => void
  onPayStatement: (transaction: Transaction) => void
}>

type ActionName = 'confirm' | 'settle' | 'revert' | 'remove'
type PendingAction = Readonly<{ action: ActionName; transaction: Transaction }> | null

const statusLabels = {
  PLANNED: 'Planejada',
  CONFIRMED: 'Confirmada',
  SETTLED: 'Liquidada',
} satisfies Record<Transaction['status'], string>
const typeLabels = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
  TRANSFER: 'Transferência',
  CARD_PAYMENT: 'Pagamento de fatura',
  INVESTMENT: 'Investimento',
} satisfies Record<Transaction['type'], string>
const isCardManaged = (transaction: Transaction) => transaction.sourceModule?.startsWith('CC')
const isStatementProjection = (transaction: Transaction) => transaction.sourceModule === 'CCP'
const actionContent = {
  confirm: {
    title: 'Confirmar transação?',
    description: 'O lançamento passará a compor os valores confirmados da competência.',
    confirmText: 'Confirmar transação',
    type: 'question' as const,
  },
  settle: {
    title: 'Liquidar transação?',
    description: 'A movimentação será marcada como efetivamente paga ou recebida.',
    confirmText: 'Liquidar',
    type: 'question' as const,
  },
  revertConfirmation: {
    title: 'Reverter confirmação?',
    description: 'A transação voltará ao estado planejado e deixará os valores confirmados.',
    confirmText: 'Reverter',
    type: 'warning' as const,
  },
  revertSettlement: {
    title: 'Reverter liquidação?',
    description: 'A transação voltará ao estado confirmado e deixará de constar como liquidada.',
    confirmText: 'Reverter liquidação',
    type: 'warning' as const,
  },
  remove: {
    title: 'Excluir transação?',
    description: 'Esta ação remove o lançamento da visão atual.',
    confirmText: 'Excluir',
    type: 'danger' as const,
  },
}

export const TransactionList = ({
  transactions,
  isLoading,
  error,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  viewMode,
  onEdit,
  onPayStatement,
}: TransactionListProps) => {
  const role = useStore(workspaceAccessStore, getActiveWorkspaceRole)
  const canMutate = role !== 'VIEWER'
  const confirm = useTransactionAction('confirm')
  const settle = useTransactionAction('settle')
  const revert = useTransactionAction('revert')
  const remove = useTransactionAction('remove')
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const mutations = { confirm, settle, revert, remove }
  const activeMutation = pendingAction ? mutations[pendingAction.action] : undefined
  const actionError = confirm.error ?? settle.error ?? revert.error ?? remove.error

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      civilDateColumn<Transaction>('occurredOn', { header: 'Data', size: 120 }),
      { accessorKey: 'description', header: 'Descrição', size: 300 },
      {
        accessorKey: 'type',
        header: 'Tipo',
        size: 140,
        cell: ({ row }) => typeLabels[row.original.type],
      },
      {
        accessorKey: 'status',
        header: 'Situação',
        size: 140,
        cell: ({ row }) => <Badge variant="outline">{statusLabels[row.original.status]}</Badge>,
      },
      {
        accessorKey: 'amountCents',
        header: 'Valor',
        size: 150,
        cell: ({ row }) => (
          <span className={row.original.type === 'INCOME' ? 'font-semibold text-emerald-600' : ''}>
            {formatMoney(row.original.amountCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Ações',
        size: 180,
        enableSorting: false,
        cell: ({ row }) => {
          const transaction = row.original
          if (isStatementProjection(transaction))
            return (
              <div className="flex justify-end">
                <TooltipButton
                  title="Pagar fatura"
                  size="icon"
                  variant="ghost"
                  disabled={!canMutate}
                  onClick={() => onPayStatement(transaction)}
                >
                  <HandCoins className="size-4" />
                </TooltipButton>
              </div>
            )
          const canMutateTransaction = canMutate && !isCardManaged(transaction)
          return (
            <div className="flex justify-end gap-1">
              <TooltipButton
                title="Editar transação"
                size="icon"
                variant="ghost"
                disabled={!canMutateTransaction}
                onClick={() => onEdit(transaction)}
              >
                <Pencil className="size-4" />
              </TooltipButton>
              {transaction.status === 'PLANNED' && (
                <TooltipButton
                  title="Confirmar transação"
                  size="icon"
                  variant="ghost"
                  disabled={!canMutateTransaction}
                  onClick={() => setPendingAction({ action: 'confirm', transaction })}
                >
                  <Check className="size-4" />
                </TooltipButton>
              )}
              {(transaction.status === 'CONFIRMED' || transaction.status === 'SETTLED') && (
                <TooltipButton
                  title={
                    transaction.status === 'SETTLED'
                      ? 'Reverter liquidação'
                      : 'Reverter confirmação'
                  }
                  size="icon"
                  variant="ghost"
                  disabled={!canMutateTransaction}
                  onClick={() => setPendingAction({ action: 'revert', transaction })}
                >
                  <RotateCcw className="size-4" />
                </TooltipButton>
              )}
              {transaction.status !== 'SETTLED' && (
                <TooltipButton
                  title="Liquidar transação"
                  size="icon"
                  variant="ghost"
                  disabled={!canMutateTransaction}
                  onClick={() => setPendingAction({ action: 'settle', transaction })}
                >
                  <CircleDollarSign className="size-4" />
                </TooltipButton>
              )}
              <TooltipButton
                title="Excluir transação"
                size="icon"
                variant="ghost"
                disabled={!canMutateTransaction}
                onClick={() => setPendingAction({ action: 'remove', transaction })}
              >
                <Trash2 className="text-destructive size-4" />
              </TooltipButton>
            </div>
          )
        },
      },
    ],
    [canMutate, onEdit, onPayStatement],
  )

  if (isLoading)
    return (
      <Card aria-busy="true">
        <CardContent className="flex min-h-48 items-center justify-center">
          <Spinner className="size-6" />
          <span className="sr-only">Carregando transações</span>
        </CardContent>
      </Card>
    )
  if (error)
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="font-medium">Não foi possível carregar as transações.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {error instanceof ApiClientError ? error.message : 'Tente novamente em instantes.'}
          </p>
        </CardContent>
      </Card>
    )

  return (
    <div className="space-y-3">
      {actionError && (
        <p role="alert" className="text-destructive text-sm">
          {actionError instanceof ApiClientError
            ? actionError.message
            : 'Não foi possível concluir a ação.'}
        </p>
      )}
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium">Nenhuma transação nesta competência.</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Use “Nova transação” para registrar o primeiro lançamento.
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <div className="h-[520px] min-w-0 rounded-xl border">
          <Table<Transaction>
            columns={columns}
            data={Array.from(transactions)}
            getRowId={(transaction) => transaction.id}
            enableRowSelection={false}
            shouldRenderCheckbox={false}
            rowEstimateSize={52}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {transactions.map((transaction) => (
            <Card
              key={transaction.id}
              className="hover:border-primary/40 flex flex-col justify-between transition-all hover:shadow-xs"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">{statusLabels[transaction.status]}</Badge>
                  <span className="text-muted-foreground text-[11px]">
                    {formatDatePtBr(transaction.occurredOn)}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <ReceiptText className="text-primary mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base leading-tight font-semibold">
                      {transaction.description}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {typeLabels[transaction.type]}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p
                  className={`text-xl font-semibold ${transaction.type === 'INCOME' ? 'text-emerald-600' : ''}`}
                >
                  {formatMoney(transaction.amountCents, transaction.currency)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Competência {formatCompetencePtBr(transaction.competenceMonth)}
                </p>
              </CardContent>
              <CardFooter className="flex items-center gap-1 border-t pt-3">
                {isStatementProjection(transaction) ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 gap-1.5 rounded-full text-xs font-medium"
                    disabled={!canMutate}
                    onClick={() => onPayStatement(transaction)}
                  >
                    <HandCoins className="size-3.5" /> Pagar fatura
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 gap-1.5 rounded-full text-xs font-medium"
                      disabled={!canMutate || Boolean(isCardManaged(transaction))}
                      title={
                        isCardManaged(transaction)
                          ? 'Gerencie esta compra pela fatura do cartão.'
                          : undefined
                      }
                      onClick={() => onEdit(transaction)}
                    >
                      <Pencil className="size-3.5" /> Editar
                    </Button>
                    {transaction.status === 'PLANNED' && (
                      <TooltipButton
                        title="Confirmar transação"
                        size="icon"
                        variant="outline"
                        className="size-8 rounded-full"
                        disabled={!canMutate || Boolean(isCardManaged(transaction))}
                        onClick={() => setPendingAction({ action: 'confirm', transaction })}
                      >
                        <Check className="size-3.5" />
                      </TooltipButton>
                    )}
                    {(transaction.status === 'CONFIRMED' || transaction.status === 'SETTLED') && (
                      <TooltipButton
                        title={
                          transaction.status === 'SETTLED'
                            ? 'Reverter liquidação'
                            : 'Reverter confirmação'
                        }
                        size="icon"
                        variant="outline"
                        className="size-8 rounded-full"
                        disabled={!canMutate || Boolean(isCardManaged(transaction))}
                        onClick={() => setPendingAction({ action: 'revert', transaction })}
                      >
                        <RotateCcw className="size-3.5" />
                      </TooltipButton>
                    )}
                    {transaction.status !== 'SETTLED' && (
                      <TooltipButton
                        title="Liquidar transação"
                        size="icon"
                        variant="outline"
                        className="size-8 rounded-full"
                        disabled={!canMutate || Boolean(isCardManaged(transaction))}
                        onClick={() => setPendingAction({ action: 'settle', transaction })}
                      >
                        <CircleDollarSign className="size-3.5" />
                      </TooltipButton>
                    )}
                    <TooltipButton
                      title="Excluir transação"
                      size="icon"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8 rounded-full"
                      disabled={!canMutate || Boolean(isCardManaged(transaction))}
                      onClick={() => setPendingAction({ action: 'remove', transaction })}
                    >
                      <Trash2 className="size-3.5" />
                    </TooltipButton>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {hasNextPage && (
        <Button variant="outline" onClick={onLoadMore} disabled={isFetchingNextPage}>
          {isFetchingNextPage && <Spinner className="mr-2 size-4" />}Carregar mais
        </Button>
      )}
      {pendingAction && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setPendingAction(null)}
          {...(pendingAction.action === 'revert'
            ? pendingAction.transaction.status === 'SETTLED'
              ? actionContent.revertSettlement
              : actionContent.revertConfirmation
            : actionContent[pendingAction.action])}
          variant={pendingAction.action === 'remove' ? 'destructive' : 'default'}
          isPending={activeMutation?.isPending}
          onConfirm={async () => {
            await activeMutation?.mutateAsync(pendingAction.transaction)
            setPendingAction(null)
          }}
        />
      )}
    </div>
  )
}
