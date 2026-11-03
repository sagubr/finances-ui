import { TooltipButton } from '@/components/TooltipButton'
import { ViewModeToggle } from '@/components/ViewModeToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useResourceViewMode } from '@/hooks/use-resource-view-mode'
import { useCompetenceMonth } from '@/modules/competence/store/competence.store'
import { planningApi } from '@/modules/planning/api/planning.api'
import { CardPurchaseForm } from '@/modules/planning/components/CardPurchaseForm'
import { StatementPaymentForm } from '@/modules/planning/components/StatementPaymentForm'
import { statementQuery, usePlanningMutation } from '@/modules/planning/queries/planning.queries'
import {
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

const SummaryValue = ({ label, value }: Readonly<{ label: string; value: string }>) => (
  <Card size="sm">
    <CardHeader>
      <CardTitle className="text-muted-foreground text-sm">{label}</CardTitle>
    </CardHeader>
    <CardContent className="text-xl font-semibold">{value}</CardContent>
  </Card>
)

export const TransactionsPage = () => {
  const [createOpen, setCreateOpen] = useState(false)
  const [createTarget, setCreateTarget] = useState<'ACCOUNT' | 'CARD' | 'TRANSFER'>('ACCOUNT')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [payingStatement, setPayingStatement] = useState<Transaction | null>(null)
  const [viewMode, setViewMode] = useResourceViewMode('transactions', 'list')
  const month = useCompetenceMonth()
  const readOnly = useStore(workspaceAccessStore, getActiveWorkspaceRole) === 'VIEWER'
  const accounts = useQuery(accountsQueryOptions())
  const categories = useQuery(categoriesQueryOptions())
  const transactions = useInfiniteQuery(transactionsQueryOptions({ month }))
  const summary = useQuery(monthlySummaryQueryOptions(month))
  const statement = useQuery(statementQuery(payingStatement?.sourcePublicId ?? ''))
  const closeStatement = usePlanningMutation(planningApi.closeStatement)
  const accountItems = accounts.data?.items ?? []
  const categoryItems = categories.data?.items ?? []
  const transactionItems =
    transactions.data?.pages
      .flatMap(({ items }) => items)
      .filter((transaction) => transaction.competenceMonth === month) ?? []
  const currency = accountItems[0]?.currency ?? 'BRL'
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
      <section className="bg-card rounded-xl border p-4" aria-label="Resumo da competência">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryValue
            label="Receitas"
            value={formatMoney(summary.data?.incomeCents ?? 0, currency)}
          />
          <SummaryValue
            label="Despesas"
            value={formatMoney(summary.data?.expenseCents ?? 0, currency)}
          />
          <SummaryValue
            label="Resultado"
            value={formatMoney(summary.data?.netCents ?? 0, currency)}
          />
          <SummaryValue
            label="Faturas previstas"
            value={formatMoney(summary.data?.plannedCardPaymentCents ?? 0, currency)}
          />
        </div>
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
              disabled={readOnly || accountItems.length === 0}
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
          viewMode={viewMode}
          onEdit={setEditingTransaction}
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
              <FieldLabel>Destino</FieldLabel>
              <SearchableSelect
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
            <p className="text-muted-foreground py-6 text-center text-sm">Carregando fatura…</p>
          )}
          {statement.isError && (
            <p role="alert" className="text-destructive py-4 text-sm">
              Não foi possível carregar a fatura. Tente novamente.
            </p>
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
