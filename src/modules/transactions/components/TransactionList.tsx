import { ApiClientError } from '@/api/api-client.error'
import { FinancialTypeBadge, type CashFlowType } from '@/components/FinancialTypeBadge'
import {
  ResourceCollectionSkeleton,
  ResourceEmptyState,
} from '@/components/ResourceCollectionState'
import { ResourceErrorState } from '@/components/ResourceErrorState'
import Table from '@/components/Table'
import { civilDateColumn } from '@/components/Table/columns/date.columns'
import { TooltipButton } from '@/components/TooltipButton'
import type { ViewMode } from '@/components/ViewModeToggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
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
  MapPin,
  Pencil,
  ReceiptText,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Transaction } from '../models/transaction.types'
import { useTransactionAction } from '../queries/transaction.queries'
import { formatMoney } from '../utils/money'
import {
  isCardManagedTransaction,
  isManualCardPurchase,
  isStatementProjection,
} from '../utils/transaction-source'
import { canSettleTransaction } from '../utils/transaction-status'

type TransactionListProps = Readonly<{
  transactions: readonly Transaction[]
  isLoading: boolean
  error: Error | null
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  onRetry: () => void
  isRetrying: boolean
  onCreate: () => void
  canCreate: boolean
  viewMode: ViewMode
  onEdit: (transaction: Transaction) => void
  onEditCardPurchase: (transaction: Transaction) => void
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

const cashFlowType = (type: Transaction['type']): CashFlowType | null => {
  if (type === 'INCOME') return 'INCOME'
  if (type === 'EXPENSE' || type === 'CARD_PAYMENT') return 'EXPENSE'
  return null
}

const signedAmount = (transaction: Transaction) => {
  if (isStatementProjection(transaction))
    return formatMoney(transaction.amountCents, transaction.currency)
  const flow = cashFlowType(transaction.type)
  const prefix = flow === 'INCOME' ? '+ ' : flow === 'EXPENSE' ? '− ' : ''
  return `${prefix}${formatMoney(transaction.amountCents, transaction.currency)}`
}
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
  onRetry,
  isRetrying,
  onCreate,
  canCreate,
  viewMode,
  onEdit,
  onEditCardPurchase,
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
      {
        accessorKey: 'description',
        header: 'Descrição',
        size: 300,
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate">{row.original.description}</span>
            {row.original.location && (
              <MapPin
                aria-label="Possui local do gasto"
                className="text-primary size-3.5 shrink-0"
              />
            )}
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        size: 140,
        cell: ({ row }) => {
          if (isStatementProjection(row.original))
            return <Badge variant="outline">Fatura planejada</Badge>
          const flow = cashFlowType(row.original.type)
          return flow ? (
            <FinancialTypeBadge type={flow} />
          ) : (
            <span className="text-muted-foreground text-xs font-medium">
              {typeLabels[row.original.type]}
            </span>
          )
        },
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
          <span
            className={cn(
              'font-semibold tabular-nums',
              isStatementProjection(row.original) && 'text-foreground',
              cashFlowType(row.original.type) === 'INCOME' &&
                'text-emerald-600 dark:text-emerald-300',
              cashFlowType(row.original.type) === 'EXPENSE' &&
                !isStatementProjection(row.original) &&
                'text-destructive',
            )}
          >
            {signedAmount(row.original)}
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
          if (transaction.type === 'TRANSFER')
            return (
              <div className="flex justify-end gap-1">
                {transaction.status === 'PLANNED' && (
                  <TooltipButton
                    title="Confirmar transferência"
                    size="icon"
                    variant="ghost"
                    disabled={!canMutate}
                    onClick={() => setPendingAction({ action: 'confirm', transaction })}
                  >
                    <Check className="size-4" />
                  </TooltipButton>
                )}
                {(transaction.status === 'CONFIRMED' || transaction.status === 'SETTLED') && (
                  <TooltipButton
                    title={
                      transaction.status === 'SETTLED'
                        ? 'Reverter liquidação da transferência'
                        : 'Reverter confirmação da transferência'
                    }
                    size="icon"
                    variant="ghost"
                    disabled={!canMutate}
                    onClick={() => setPendingAction({ action: 'revert', transaction })}
                  >
                    <RotateCcw className="size-4" />
                  </TooltipButton>
                )}
                {canSettleTransaction(transaction.status) && (
                  <TooltipButton
                    title="Liquidar transferência"
                    size="icon"
                    variant="ghost"
                    disabled={!canMutate}
                    onClick={() => setPendingAction({ action: 'settle', transaction })}
                  >
                    <CircleDollarSign className="size-4" />
                  </TooltipButton>
                )}
              </div>
            )
          const manualCardPurchase = isManualCardPurchase(transaction)
          if (isCardManagedTransaction(transaction) && !manualCardPurchase)
            return (
              <span
                className="text-muted-foreground text-xs"
                title="Este lançamento é controlado pela fatura, parcelamento ou recorrência de origem."
              >
                Gerenciado no cartão
              </span>
            )
          const canMutateTransaction = canMutate && !isCardManagedTransaction(transaction)
          const canEdit =
            canMutate && (manualCardPurchase || !isCardManagedTransaction(transaction))
          return (
            <div className="flex justify-end gap-1">
              <TooltipButton
                title={manualCardPurchase ? 'Editar compra do cartão' : 'Editar transação'}
                size="icon"
                variant="ghost"
                disabled={!canEdit}
                onClick={() =>
                  manualCardPurchase ? onEditCardPurchase(transaction) : onEdit(transaction)
                }
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
              {canSettleTransaction(transaction.status) && (
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
    [canMutate, onEdit, onEditCardPurchase, onPayStatement],
  )

  if (isLoading) return <ResourceCollectionSkeleton viewMode={viewMode} />
  if (error)
    return (
      <ResourceErrorState
        title="Não foi possível carregar as transações"
        error={error}
        fallbackMessage="Tente novamente em instantes."
        onRetry={onRetry}
        isRetrying={isRetrying}
        compact
      />
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
        <ResourceEmptyState
          title="Nenhuma transação nesta competência"
          description="Cadastre um lançamento ou confira outra competência para visualizar seus registros."
          actionLabel="Cadastrar transação"
          onAction={onCreate}
          actionDisabled={!canMutate || !canCreate}
        />
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {transactions.map((transaction) => (
            <Card
              key={transaction.id}
              size="sm"
              className={cn(
                'flex flex-col justify-between border-l-4 transition-all hover:shadow-xs',
                isStatementProjection(transaction)
                  ? 'border-l-slate-400 hover:border-slate-400'
                  : cashFlowType(transaction.type) === 'INCOME'
                    ? 'border-l-emerald-500 hover:border-emerald-500'
                    : cashFlowType(transaction.type) === 'EXPENSE'
                      ? 'border-l-destructive hover:border-destructive'
                      : 'border-l-muted-foreground/30 hover:border-l-primary',
              )}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                    {statusLabels[transaction.status]}
                  </Badge>
                  <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    {transaction.location && (
                      <MapPin aria-label="Possui local do gasto" className="text-primary size-3" />
                    )}
                    {formatDatePtBr(transaction.occurredOn)}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <ReceiptText
                    className={cn(
                      'mt-0.5 size-3.5 shrink-0',
                      isStatementProjection(transaction)
                        ? 'text-muted-foreground'
                        : cashFlowType(transaction.type) === 'INCOME'
                          ? 'text-emerald-600 dark:text-emerald-300'
                          : cashFlowType(transaction.type) === 'EXPENSE'
                            ? 'text-destructive'
                            : 'text-primary',
                    )}
                  />
                  <div className="min-w-0">
                    <CardTitle className="truncate text-sm leading-tight font-semibold">
                      {transaction.description}
                    </CardTitle>
                    <div className="mt-1">
                      {isStatementProjection(transaction) ? (
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                          Fatura planejada
                        </Badge>
                      ) : cashFlowType(transaction.type) ? (
                        <FinancialTypeBadge
                          type={cashFlowType(transaction.type) as CashFlowType}
                          className="h-5 px-1.5 text-[10px]"
                        />
                      ) : (
                        <p className="text-muted-foreground text-[11px]">
                          {typeLabels[transaction.type]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p
                  className={cn(
                    'truncate text-lg font-semibold tabular-nums',
                    cashFlowType(transaction.type) === 'INCOME' &&
                      'text-emerald-600 dark:text-emerald-300',
                    cashFlowType(transaction.type) === 'EXPENSE' &&
                      !isStatementProjection(transaction) &&
                      'text-destructive',
                  )}
                >
                  {signedAmount(transaction)}
                </p>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
                  Competência {formatCompetencePtBr(transaction.competenceMonth)}
                </p>
              </CardContent>
              <CardFooter className="flex min-h-[52px] gap-2 border-t pt-3">
                {isStatementProjection(transaction) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 rounded-full"
                    disabled={!canMutate}
                    onClick={() => onPayStatement(transaction)}
                  >
                    <HandCoins /> Pagar fatura
                  </Button>
                ) : transaction.type === 'TRANSFER' ? (
                  <>
                    {transaction.status === 'PLANNED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 flex-1 rounded-full"
                        disabled={!canMutate}
                        onClick={() => setPendingAction({ action: 'confirm', transaction })}
                      >
                        <Check /> Confirmar
                      </Button>
                    )}
                    {transaction.status === 'SETTLED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 flex-1 rounded-full"
                        disabled={!canMutate}
                        onClick={() => setPendingAction({ action: 'revert', transaction })}
                      >
                        <RotateCcw /> Reverter liquidação
                      </Button>
                    )}
                    {canSettleTransaction(transaction.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 flex-1 rounded-full"
                        disabled={!canMutate}
                        onClick={() => setPendingAction({ action: 'settle', transaction })}
                      >
                        <CircleDollarSign /> Liquidar
                      </Button>
                    )}
                    {transaction.status === 'CONFIRMED' && (
                      <TooltipButton
                        title="Reverter confirmação da transferência"
                        size="icon"
                        variant="outline"
                        className="size-8 rounded-full"
                        disabled={!canMutate}
                        onClick={() => setPendingAction({ action: 'revert', transaction })}
                      >
                        <RotateCcw />
                      </TooltipButton>
                    )}
                  </>
                ) : isCardManagedTransaction(transaction) && !isManualCardPurchase(transaction) ? (
                  <div
                    className="text-muted-foreground flex h-8 flex-1 items-center justify-center rounded-full border px-3 text-[11px]"
                    title="Este lançamento é controlado pela fatura, parcelamento ou recorrência de origem."
                  >
                    Gerenciado no cartão
                  </div>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-full"
                      disabled={!canMutate}
                      onClick={() =>
                        isManualCardPurchase(transaction)
                          ? onEditCardPurchase(transaction)
                          : onEdit(transaction)
                      }
                    >
                      <Pencil /> {isManualCardPurchase(transaction) ? 'Editar compra' : 'Editar'}
                    </Button>
                    {transaction.status === 'PLANNED' && (
                      <TooltipButton
                        title="Confirmar transação"
                        size="icon"
                        variant="outline"
                        className="size-8 rounded-full"
                        disabled={!canMutate || isCardManagedTransaction(transaction)}
                        onClick={() => setPendingAction({ action: 'confirm', transaction })}
                      >
                        <Check />
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
                        disabled={!canMutate || isCardManagedTransaction(transaction)}
                        onClick={() => setPendingAction({ action: 'revert', transaction })}
                      >
                        <RotateCcw />
                      </TooltipButton>
                    )}
                    {canSettleTransaction(transaction.status) && (
                      <TooltipButton
                        title="Liquidar transação"
                        size="icon"
                        variant="outline"
                        className="size-8 rounded-full"
                        disabled={!canMutate || isCardManagedTransaction(transaction)}
                        onClick={() => setPendingAction({ action: 'settle', transaction })}
                      >
                        <CircleDollarSign />
                      </TooltipButton>
                    )}
                    <TooltipButton
                      title="Excluir transação"
                      size="icon"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8 rounded-full"
                      disabled={!canMutate || isCardManagedTransaction(transaction)}
                      onClick={() => setPendingAction({ action: 'remove', transaction })}
                    >
                      <Trash2 />
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
