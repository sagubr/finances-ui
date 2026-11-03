import { ResourceErrorState } from '@/components/ResourceErrorState'
import { TooltipButton } from '@/components/TooltipButton'
import { ViewModeToggle } from '@/components/ViewModeToggle'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { ManagementBarContainer } from '@/components/ui/management-bar'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Skeleton } from '@/components/ui/skeleton'
import { useResourceViewMode } from '@/hooks/use-resource-view-mode'
import { useCompetenceMonth } from '@/modules/competence/store/competence.store'
import { planningApi } from '@/modules/planning/api/planning.api'
import { CardPurchaseForm } from '@/modules/planning/components/CardPurchaseForm'
import { StatementPaymentForm } from '@/modules/planning/components/StatementPaymentForm'
import {
  cardsQuery,
  statementQuery,
  usePlanningMutation,
} from '@/modules/planning/queries/planning.queries'
import {
  getActiveWorkspaceBaseCurrency,
  getActiveWorkspaceRole,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { TransactionForm } from '../components/TransactionForm'
import { TransactionList } from '../components/TransactionList'
import { TransferForm } from '../components/TransferForm'
import type { Transaction } from '../models/transaction.types'
import {
  accountsQueryOptions,
  categoriesQueryOptions,
  monthlySummaryQueryOptions,
  transactionsQueryOptions,
} from '../queries/transaction.queries'
import { formatMoney } from '../utils/money'
import { deduplicateTransferLegs } from '../utils/transaction-source'

const SummaryValue = ({ label, value }: Readonly<{ label: string; value: string }>) => (
  <div className="bg-card ring-foreground/10 min-w-0 rounded-lg px-3 py-2.5 ring-1">
    <p className="text-muted-foreground truncate text-[11px] font-medium">{label}</p>
    <p className="mt-1 truncate text-base font-semibold tabular-nums">{value}</p>
  </div>
)

export const TransactionsPage = () => {
  const [createOpen, setCreateOpen] = useState(false)
  const [createTarget, setCreateTarget] = useState<'ACCOUNT' | 'CARD' | 'TRANSFER'>('ACCOUNT')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingCardPurchase, setEditingCardPurchase] = useState<Transaction | null>(null)
  const [payingStatement, setPayingStatement] = useState<Transaction | null>(null)
  const [viewMode, setViewMode] = useResourceViewMode('transactions', 'list')
  const month = useCompetenceMonth()
  const readOnly = useStore(workspaceAccessStore, getActiveWorkspaceRole) === 'VIEWER'
  const currency = useStore(workspaceAccessStore, getActiveWorkspaceBaseCurrency)
  const accounts = useQuery(accountsQueryOptions())
  const categories = useQuery(categoriesQueryOptions())
  const transactions = useInfiniteQuery(transactionsQueryOptions({ month }))
  const summary = useQuery(monthlySummaryQueryOptions(month))
  const statement = useQuery(statementQuery(payingStatement?.sourcePublicId ?? ''))
  const cardPurchaseStatement = useQuery(statementQuery(editingCardPurchase?.sourcePublicId ?? ''))
  const cards = useQuery({ ...cardsQuery(), enabled: Boolean(editingCardPurchase) })
  const closeStatement = usePlanningMutation(planningApi.closeStatement)
  const accountItems = accounts.data?.items ?? []
  const hasActiveAccount = accountItems.some(({ active }) => active)
  const categoryItems = categories.data?.items ?? []
  const transactionItems = deduplicateTransferLegs(
    transactions.data?.pages
      .flatMap(({ items }) => items)
      .filter((transaction) => transaction.competenceMonth === month) ?? [],
  )
  const purchaseToEdit = cardPurchaseStatement.data?.purchases.items.find(
    ({ id }) => id === editingCardPurchase?.id,
  )
  const purchaseCard = cards.data?.items.find(({ id }) => id === cardPurchaseStatement.data?.cardId)
  const closeCreate = () => {
    setCreateOpen(false)
    setCreateTarget('ACCOUNT')
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header>
        <div>
          <h1 className="font-heading text-2xl font-semibold">Transações</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Receitas, despesas e liquidações da competência selecionada.
          </p>
        </div>
      </header>
      {(accounts.isError || categories.isError) && (
        <ResourceErrorState
          compact
          title="Não foi possível carregar contas e categorias"
          error={accounts.error ?? categories.error}
          fallbackMessage="Os lançamentos podem ser consultados, mas novos registros dependem desses dados."
          onRetry={() => {
            void accounts.refetch()
            void categories.refetch()
          }}
          isRetrying={accounts.isFetching || categories.isFetching}
        />
      )}
      <section aria-label="Resumo da competência">
        {summary.isPending || !currency ? (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4" aria-label="Carregando resumo">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-[65px] rounded-lg" />
            ))}
          </div>
        ) : summary.isError ? (
          <ResourceErrorState
            compact
            title="Não foi possível carregar o resumo"
            error={summary.error}
            fallbackMessage="Tente carregar os totais da competência novamente."
            onRetry={() => void summary.refetch()}
            isRetrying={summary.isFetching}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <SummaryValue
              label="Receitas"
              value={formatMoney(summary.data.incomeCents, currency)}
            />
            <SummaryValue
              label="Despesas"
              value={formatMoney(summary.data.expenseCents, currency)}
            />
            <SummaryValue label="Resultado" value={formatMoney(summary.data.netCents, currency)} />
            <SummaryValue
              label="Faturas previstas"
              value={formatMoney(summary.data.plannedCardPaymentCents, currency)}
            />
          </div>
        )}
      </section>
      <section className="space-y-4" aria-labelledby="transaction-records-title">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="transaction-records-title" className="font-heading text-lg font-semibold">
              Registros
            </h2>
            <p className="text-muted-foreground text-xs">
              {transactionItems.length} transações carregadas
            </p>
          </div>
          <ManagementBarContainer className="shadow-sm">
            <ViewModeToggle value={viewMode} onValueChange={setViewMode} />
            <TooltipButton
              title="Nova transação"
              size="icon"
              className="size-8 shrink-0"
              disabled={readOnly || !hasActiveAccount}
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
            </TooltipButton>
          </ManagementBarContainer>
        </div>
        <TransactionList
          transactions={transactionItems}
          isLoading={transactions.isLoading}
          error={transactions.error}
          hasNextPage={transactions.hasNextPage}
          isFetchingNextPage={transactions.isFetchingNextPage}
          onLoadMore={() => void transactions.fetchNextPage()}
          onRetry={() => void transactions.refetch()}
          isRetrying={transactions.isFetching}
          onCreate={() => setCreateOpen(true)}
          canCreate={hasActiveAccount}
          viewMode={viewMode}
          onEdit={setEditingTransaction}
          onEditCardPurchase={setEditingCardPurchase}
          onPayStatement={setPayingStatement}
        />
      </section>
      <Dialog
        open={createOpen || Boolean(editingTransaction)}
        onOpenChange={(open) => {
          if (open) return
          closeCreate()
          setEditingTransaction(null)
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Editar transação' : 'Nova transação'}</DialogTitle>
            <DialogDescription>
              {editingTransaction
                ? 'Atualize os dados do lançamento selecionado.'
                : 'Escolha o destino. A data definirá automaticamente a competência e, no cartão, a fatura.'}
            </DialogDescription>
          </DialogHeader>
          {!editingTransaction && (
            <Field>
              <FieldLabel htmlFor="transaction-create-target">Destino</FieldLabel>
              <SearchableSelect
                id="transaction-create-target"
                value={createTarget}
                onValueChange={(value) => setCreateTarget(value as 'ACCOUNT' | 'CARD' | 'TRANSFER')}
                options={[
                  { value: 'ACCOUNT', label: 'Conta' },
                  { value: 'CARD', label: 'Cartão de crédito' },
                  { value: 'TRANSFER', label: 'Transferência ou aporte' },
                ]}
              />
            </Field>
          )}
          {editingTransaction || createTarget === 'ACCOUNT' ? (
            <TransactionForm
              key={editingTransaction?.id ?? 'create-account'}
              accounts={accountItems}
              categories={categoryItems}
              transaction={editingTransaction ?? undefined}
              onCancel={() => {
                closeCreate()
                setEditingTransaction(null)
              }}
              onSuccess={() => {
                closeCreate()
                setEditingTransaction(null)
              }}
            />
          ) : createTarget === 'CARD' ? (
            <CardPurchaseForm
              key="create-card"
              readOnly={readOnly}
              onCancel={closeCreate}
              onSuccess={closeCreate}
            />
          ) : (
            <TransferForm
              key="create-transfer"
              accounts={accountItems.filter(({ active }) => active)}
              onCancel={closeCreate}
              onSuccess={closeCreate}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editingCardPurchase)}
        onOpenChange={(open) => !open && setEditingCardPurchase(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar compra do cartão</DialogTitle>
            <DialogDescription>
              A fatura será recalculada. Alterar a data pode mover a compra para outra fatura
              aberta.
            </DialogDescription>
          </DialogHeader>
          {(cardPurchaseStatement.isLoading || cards.isLoading) && (
            <Skeleton className="h-56 w-full rounded-xl" aria-label="Carregando compra" />
          )}
          {(cardPurchaseStatement.isError || cards.isError) && (
            <ResourceErrorState
              compact
              title="Não foi possível localizar a compra original"
              error={cardPurchaseStatement.error ?? cards.error}
              fallbackMessage="Lançamentos gerados por parcelamento ou recorrência devem ser corrigidos na origem."
              onRetry={() => {
                void cardPurchaseStatement.refetch()
                void cards.refetch()
              }}
              isRetrying={cardPurchaseStatement.isFetching || cards.isFetching}
            />
          )}
          {cardPurchaseStatement.data && !purchaseToEdit && (
            <p role="alert" className="text-destructive py-4 text-sm">
              Esta compra não está disponível para edição direta. Verifique se ela pertence a um
              parcelamento, recorrência ou fatura já fechada.
            </p>
          )}
          {purchaseToEdit && !purchaseToEdit.editable && (
            <p role="alert" className="text-destructive py-4 text-sm">
              A compra pertence a uma fatura fechada e não pode mais ser alterada diretamente.
            </p>
          )}
          {purchaseToEdit?.editable && purchaseCard && (
            <CardPurchaseForm
              key={`${purchaseToEdit.id}-${purchaseToEdit.version}`}
              card={purchaseCard}
              purchase={purchaseToEdit}
              readOnly={readOnly}
              onCancel={() => setEditingCardPurchase(null)}
              onSuccess={() => setEditingCardPurchase(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(payingStatement)}
        onOpenChange={(open) => !open && setPayingStatement(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pagar fatura</DialogTitle>
            <DialogDescription>
              Registre o pagamento pela conta escolhida. Pagamentos parciais mantêm o saldo restante
              planejado.
            </DialogDescription>
          </DialogHeader>
          {statement.isLoading && (
            <Skeleton className="h-48 w-full rounded-xl" aria-label="Carregando fatura" />
          )}
          {statement.isError && (
            <ResourceErrorState
              compact
              title="Não foi possível carregar a fatura"
              error={statement.error}
              fallbackMessage="Tente carregar a fatura novamente."
              onRetry={() => void statement.refetch()}
              isRetrying={statement.isFetching}
            />
          )}
          {statement.data?.status === 'OPEN' && (
            <>
              <p className="text-muted-foreground text-sm">
                A fatura ainda está aberta. Feche-a para registrar o pagamento sem alterar as
                compras já lançadas.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPayingStatement(null)}>
                  Cancelar
                </Button>
                <Button
                  disabled={closeStatement.isPending}
                  onClick={() => {
                    if (statement.data) void closeStatement.mutateAsync(statement.data)
                  }}
                >
                  {closeStatement.isPending ? 'Fechando…' : 'Fechar fatura'}
                </Button>
              </DialogFooter>
            </>
          )}
          {(statement.data?.status === 'CLOSED' || statement.data?.status === 'PARTIALLY_PAID') &&
            payingStatement && (
              <StatementPaymentForm
                key={`${statement.data.id}-${statement.data.version}`}
                statement={statement.data}
                currency={payingStatement.currency}
                onCancel={() => setPayingStatement(null)}
                onSuccess={() => setPayingStatement(null)}
              />
            )}
          {statement.data?.status === 'PAID' && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Esta fatura já está integralmente paga.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPayingStatement(null)}>
                  Fechar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
