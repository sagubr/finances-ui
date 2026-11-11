import {
  ResourceCollectionSkeleton,
  ResourceEmptyState,
} from '@/components/ResourceCollectionState'
import { ResourceErrorState } from '@/components/ResourceErrorState'
import { ResourceViewToolbar } from '@/components/ResourceViewToolbar'
import Table from '@/components/Table'
import { TooltipButton } from '@/components/TooltipButton'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useResourceViewMode } from '@/hooks/useResourceViewStore'
import { getDomainLabel } from '@/lib/domain-labels'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/modules/transactions/utils/money'
import {
  getActiveWorkspaceRole,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { formatDatePtBr } from '@/utils/date'
import { filterResources } from '@/utils/resource-search'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, HandCoins, Pencil, ReceiptText, RotateCcw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { planningApi } from '../api/planning.api'
import { CardPurchaseForm } from '../components/CardPurchaseForm'
import { StatementPaymentForm } from '../components/StatementPaymentForm'
import { StatementTimeline } from '../components/StatementTimeline'
import type { Statement, StatementPurchase } from '../models/planning.types'
import {
  cardsQuery,
  statementQuery,
  statementsQuery,
  useDeleteCardPurchase,
  usePlanningMutation,
} from '../queries/planning.queries'

export type StatementStatusFilter = Statement['status'] | 'ALL'
export type CardStatementView = 'current' | 'statements'

export const CardDetailsPage = ({
  cardId,
  statementId,
  status,
  search,
  view,
  onFiltersChange,
}: Readonly<{
  cardId: string
  statementId?: string
  status: StatementStatusFilter
  search: string
  view: CardStatementView
  onFiltersChange: (filters: {
    statementId?: string
    status?: StatementStatusFilter
    search?: string
    view?: CardStatementView
  }) => void
}>) => {
  const readOnly = useStore(workspaceAccessStore, getActiveWorkspaceRole) === 'VIEWER'
  const cards = useQuery(cardsQuery())
  const statements = useQuery(statementsQuery(cardId))
  const card = cards.data?.items.find(({ id }) => id === cardId)
  const orderedStatements = useMemo(
    () =>
      [...(statements.data?.items ?? [])].sort((left, right) =>
        left.dueOn.localeCompare(right.dueOn),
      ),
    [statements.data?.items],
  )
  const currentStatement = orderedStatements.find((statement) => statement.status !== 'PAID')
  const filteredStatements = useMemo(
    () => orderedStatements.filter((statement) => status === 'ALL' || statement.status === status),
    [orderedStatements, status],
  )
  const selectedTimelineStatement =
    filteredStatements.find(({ id }) => id === statementId) ??
    filteredStatements.at(0) ??
    currentStatement ??
    orderedStatements.at(-1)
  const activeStatementId =
    view === 'current' ? (currentStatement?.id ?? '') : (selectedTimelineStatement?.id ?? '')
  const detail = useQuery(statementQuery(activeStatementId))
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [closingStatement, setClosingStatement] = useState<Statement | null>(null)
  const [reopeningStatement, setReopeningStatement] = useState<Statement | null>(null)
  const [editingPurchase, setEditingPurchase] = useState<StatementPurchase | null>(null)
  const [deletingPurchase, setDeletingPurchase] = useState<StatementPurchase | null>(null)
  const [statementSearch, setStatementSearch] = useState('')
  const [statementView, setStatementView] = useResourceViewMode('card-statements', 'list')
  const [purchaseView, setPurchaseView] = useResourceViewMode('statement-purchases', 'list')
  const closeMutation = usePlanningMutation(planningApi.closeStatement)
  const reopenMutation = usePlanningMutation(planningApi.reopenStatement)
  const deletePurchase = useDeleteCardPurchase()
  const selectedStatement = orderedStatements.find(({ id }) => id === activeStatementId)
  const searchedStatements = filterResources(filteredStatements, statementSearch)
  const purchases = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
    if (!normalizedSearch) return detail.data?.purchases.items ?? []
    return (detail.data?.purchases.items ?? []).filter((purchase) =>
      purchase.description.toLocaleLowerCase('pt-BR').includes(normalizedSearch),
    )
  }, [detail.data?.purchases.items, search])

  const statementColumns = useMemo<ColumnDef<Statement>[]>(
    () => [
      {
        accessorKey: 'cycleStartOn',
        header: 'Ciclo',
        size: 220,
        cell: ({ row }) =>
          `${formatDatePtBr(row.original.cycleStartOn)} a ${formatDatePtBr(row.original.cycleEndOn)}`,
      },
      {
        accessorKey: 'dueOn',
        header: 'Vencimento',
        size: 140,
        cell: ({ row }) => formatDatePtBr(row.original.dueOn),
      },
      {
        accessorKey: 'status',
        header: 'Situação',
        size: 160,
        cell: ({ row }) => getDomainLabel(row.original.status),
      },
      {
        accessorKey: 'totalCents',
        header: 'Total',
        size: 160,
        cell: ({ row }) => (card ? formatMoney(row.original.totalCents, card.currency) : '—'),
      },
    ],
    [card],
  )
  const purchaseColumns = useMemo<ColumnDef<StatementPurchase>[]>(
    () => [
      { accessorKey: 'description', header: 'Descrição', size: 360 },
      {
        accessorKey: 'occurredOn',
        header: 'Data',
        size: 140,
        cell: ({ row }) => formatDatePtBr(row.original.occurredOn),
      },
      {
        accessorKey: 'amountCents',
        header: 'Valor',
        size: 180,
        cell: ({ row }) => formatMoney(row.original.amountCents, row.original.currency),
      },
      {
        id: 'actions',
        header: 'Ações',
        size: 120,
        cell: ({ row }) =>
          row.original.editable ? (
            <div className="flex justify-end gap-1">
              <TooltipButton
                title="Editar compra"
                variant="ghost"
                size="icon"
                disabled={readOnly}
                onClick={() => setEditingPurchase(row.original)}
              >
                <Pencil className="size-4" />
              </TooltipButton>
              <TooltipButton
                title="Excluir compra"
                variant="ghost"
                size="icon"
                disabled={readOnly}
                onClick={() => setDeletingPurchase(row.original)}
              >
                <Trash2 className="text-destructive size-4" />
              </TooltipButton>
            </div>
          ) : null,
      },
    ],
    [readOnly, setDeletingPurchase, setEditingPurchase],
  )

  if (cards.isError || statements.isError)
    return (
      <ResourceErrorState
        title="Não foi possível carregar o cartão"
        error={cards.error ?? statements.error}
        fallbackMessage="Tente carregar os detalhes novamente."
        isRetrying={cards.isFetching || statements.isFetching}
        onRetry={() => {
          void cards.refetch()
          void statements.refetch()
        }}
      />
    )

  if (cards.isLoading || statements.isLoading)
    return <ResourceCollectionSkeleton viewMode="list" rows={8} />

  if (!card)
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-semibold">Cartão não encontrado</h1>
        <Link
          to="/accounts"
          search={{ tab: 'cards' }}
          className={buttonVariants({ variant: 'outline' })}
        >
          <ArrowLeft /> Voltar para cartões
        </Link>
      </div>
    )

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div className="space-y-2">
          <Link
            to="/accounts"
            search={{ tab: 'cards' }}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-3')}
          >
            <ArrowLeft /> Cartões
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-semibold">{card?.name ?? 'Cartão'}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Faturas, compras, fechamento e pagamentos em um único lugar.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo do cartão">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">Limite</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {card ? formatMoney(card.limitCents, card.currency) : '—'}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">Fatura selecionada</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {selectedStatement ? formatMoney(selectedStatement.totalCents, card.currency) : '—'}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">Pago</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {selectedStatement ? formatMoney(selectedStatement.paidCents, card.currency) : '—'}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm">Vencimento</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {formatDatePtBr(selectedStatement?.dueOn)}
          </CardContent>
        </Card>
      </section>

      <Tabs
        value={view}
        onValueChange={(value) => onFiltersChange({ view: value as CardStatementView })}
        className="min-w-0 gap-5"
      >
        <TabsList className="grid min-h-14 w-full grid-cols-2 p-1.5">
          <TabsTrigger value="current" className="min-h-11">
            Fatura atual
          </TabsTrigger>
          <TabsTrigger value="statements" className="min-h-11">
            Próximas e histórico
          </TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div>
                <p className="font-medium">
                  {currentStatement
                    ? `Vencimento em ${formatDatePtBr(currentStatement.dueOn)}`
                    : 'Nenhuma fatura atual'}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {currentStatement
                    ? `${formatDatePtBr(currentStatement.cycleStartOn)} a ${formatDatePtBr(currentStatement.cycleEndOn)}`
                    : 'Uma fatura será criada automaticamente ao lançar uma compra.'}
                </p>
              </div>
              {currentStatement && (
                <strong className="text-xl">
                  {formatMoney(currentStatement.totalCents, card.currency)}
                </strong>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="statements" className="min-w-0 space-y-4">
          <StatementTimeline
            statements={orderedStatements}
            selectedId={selectedTimelineStatement?.id}
            currency={card.currency}
            onSelect={(id) => onFiltersChange({ statementId: id })}
          />
          <Card className="min-w-0 overflow-hidden">
            <CardContent className="space-y-4 p-4">
              <ResourceViewToolbar
                count={searchedStatements.length}
                label="faturas"
                singularLabel="fatura"
                viewMode={statementView}
                onViewModeChange={setStatementView}
                search={{
                  value: statementSearch,
                  onValueChange: setStatementSearch,
                  placeholder: 'Buscar fatura',
                }}
              />
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <SearchableSelect
                  aria-label="Filtrar faturas por situação"
                  value={status}
                  onValueChange={(value) =>
                    onFiltersChange({
                      status: value as StatementStatusFilter,
                      statementId: undefined,
                    })
                  }
                  className="w-full min-w-0"
                  options={[
                    { value: 'ALL', label: 'Todas as situações' },
                    { value: 'OPEN', label: 'Abertas' },
                    { value: 'CLOSED', label: 'Fechadas' },
                    { value: 'PARTIALLY_PAID', label: 'Parcialmente pagas' },
                    { value: 'PAID', label: 'Pagas' },
                  ]}
                />
                <SearchableSelect
                  aria-label="Selecionar fatura"
                  value={selectedTimelineStatement?.id ?? ''}
                  onValueChange={(value) => onFiltersChange({ statementId: value })}
                  className="w-full min-w-0"
                  placeholder="Selecione uma fatura"
                  options={filteredStatements.map((statement) => ({
                    value: statement.id,
                    label: `Vence ${formatDatePtBr(statement.dueOn)}`,
                    badge: getDomainLabel(statement.status),
                  }))}
                />
              </div>
              {statements.isPending ? (
                <ResourceCollectionSkeleton
                  viewMode={statementView}
                  rows={4}
                  className="h-[320px]"
                />
              ) : searchedStatements.length === 0 ? (
                <ResourceEmptyState
                  title="Nenhuma fatura encontrada"
                  description="Altere os filtros ou faça uma compra para criar a primeira fatura."
                />
              ) : statementView === 'list' ? (
                <div className="h-[320px] min-w-0 rounded-xl border">
                  <Table
                    columns={statementColumns}
                    data={searchedStatements}
                    getRowId={(item) => item.id}
                    enableRowSelection={false}
                    shouldRenderCheckbox={false}
                    onRowClick={({ row }) => onFiltersChange({ statementId: row.original.id })}
                  />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {searchedStatements.map((statement) => {
                    const selected = statement.id === selectedTimelineStatement?.id
                    return (
                      <button
                        key={statement.id}
                        type="button"
                        aria-pressed={selected}
                        className="focus-visible:ring-ring/50 rounded-xl text-left outline-none focus-visible:ring-3"
                        onClick={() => onFiltersChange({ statementId: statement.id })}
                      >
                        <Card
                          size="sm"
                          className={cn(
                            'hover:border-primary/40 hover:bg-muted/30 h-full transition-colors',
                            selected && 'border-primary/60 bg-primary/5',
                          )}
                        >
                          <CardHeader className="gap-2">
                            <div className="flex items-center justify-between gap-3">
                              <CardTitle className="text-base">
                                Vence {formatDatePtBr(statement.dueOn)}
                              </CardTitle>
                              <span className="text-muted-foreground text-xs">
                                {getDomainLabel(statement.status)}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {formatDatePtBr(statement.cycleStartOn)} a{' '}
                              {formatDatePtBr(statement.cycleEndOn)}
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-xl font-semibold">
                              {formatMoney(statement.totalCents, card.currency)}
                            </p>
                            <div className="text-muted-foreground flex items-center justify-between text-xs">
                              <span>Pago</span>
                              <span className="font-medium">
                                {formatMoney(statement.paidCents, card.currency)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <section className="space-y-4">
          <div>
            <div>
              <h2 className="font-heading text-lg font-semibold">Compras da fatura</h2>
              <p className="text-muted-foreground text-xs">
                {selectedStatement
                  ? `${formatDatePtBr(selectedStatement.cycleStartOn)} a ${formatDatePtBr(selectedStatement.cycleEndOn)} · ${getDomainLabel(selectedStatement.status)}`
                  : 'Selecione uma fatura para consultar as compras.'}
              </p>
            </div>
          </div>
          <ResourceViewToolbar
            count={purchases.length}
            label="compras"
            singularLabel="compra"
            viewMode={purchaseView}
            onViewModeChange={setPurchaseView}
            search={{
              value: search,
              onValueChange: (value) => onFiltersChange({ search: value }),
              placeholder: 'Buscar por descrição da compra',
            }}
            actions={
              <>
                {selectedStatement?.status === 'OPEN' && (
                  <TooltipButton
                    title="Fechar fatura"
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0"
                    disabled={readOnly}
                    onClick={() => setClosingStatement(selectedStatement)}
                  >
                    <ReceiptText />
                  </TooltipButton>
                )}
                {selectedStatement?.status === 'CLOSED' && selectedStatement.paidCents === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 rounded-full"
                    disabled={readOnly}
                    onClick={() => setReopeningStatement(selectedStatement)}
                  >
                    <RotateCcw className="size-4" /> Reabrir
                  </Button>
                )}
                {(selectedStatement?.status === 'CLOSED' ||
                  selectedStatement?.status === 'PARTIALLY_PAID') && (
                  <TooltipButton
                    title="Pagar fatura"
                    size="icon"
                    className="size-8 shrink-0"
                    disabled={readOnly}
                    onClick={() => setPaymentOpen(true)}
                  >
                    <HandCoins />
                  </TooltipButton>
                )}
              </>
            }
          />
          {detail.isPending && activeStatementId ? (
            <ResourceCollectionSkeleton viewMode={purchaseView} rows={6} className="h-[420px]" />
          ) : detail.isError ? (
            <ResourceErrorState
              compact
              title="Não foi possível carregar as compras"
              error={detail.error}
              fallbackMessage="Tente carregar as compras da fatura novamente."
              onRetry={() => void detail.refetch()}
              isRetrying={detail.isFetching}
            />
          ) : purchases.length === 0 ? (
            <ResourceEmptyState
              title={search ? 'Nenhuma compra encontrada' : 'Nenhuma compra nesta fatura'}
              description={
                search
                  ? 'Altere a busca para localizar outro lançamento.'
                  : 'As compras vinculadas à fatura aparecerão aqui.'
              }
            />
          ) : purchaseView === 'list' ? (
            <div className="h-[420px] rounded-xl border">
              <Table
                columns={purchaseColumns}
                data={purchases}
                getRowId={(item) => item.id}
                enableRowSelection={false}
                shouldRenderCheckbox={false}
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {purchases.map((purchase) => (
                <Card key={purchase.id} size="sm" className="flex h-full flex-col">
                  <CardHeader className="gap-2">
                    <div className="flex items-start gap-2">
                      <ReceiptText className="text-primary mt-0.5 size-4 shrink-0" />
                      <CardTitle className="text-base leading-snug break-words">
                        {purchase.description}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 items-end justify-between gap-3">
                    <span className="text-muted-foreground text-xs">
                      {formatDatePtBr(purchase.occurredOn)}
                    </span>
                    <strong className="text-lg tabular-nums">
                      {formatMoney(purchase.amountCents, purchase.currency)}
                    </strong>
                  </CardContent>
                  {purchase.editable && (
                    <CardFooter className="flex justify-end gap-1 border-t pt-3">
                      <TooltipButton
                        title="Editar compra"
                        variant="ghost"
                        size="icon"
                        disabled={readOnly}
                        onClick={() => setEditingPurchase(purchase)}
                      >
                        <Pencil className="size-4" />
                      </TooltipButton>
                      <TooltipButton
                        title="Excluir compra"
                        variant="ghost"
                        size="icon"
                        disabled={readOnly}
                        onClick={() => setDeletingPurchase(purchase)}
                      >
                        <Trash2 className="text-destructive size-4" />
                      </TooltipButton>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      </Tabs>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pagamento da fatura</DialogTitle>
            <DialogDescription>
              O pagamento será vinculado à fatura e à conta selecionada.
            </DialogDescription>
          </DialogHeader>
          {selectedStatement && card && (
            <StatementPaymentForm
              key={`${selectedStatement.id}-${selectedStatement.version}`}
              statement={selectedStatement}
              currency={card.currency}
              onCancel={() => setPaymentOpen(false)}
              onSuccess={() => setPaymentOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editingPurchase)}
        onOpenChange={(open) => !open && setEditingPurchase(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar compra</DialogTitle>
            <DialogDescription>
              Alterar a data pode mover a compra para outra fatura aberta.
            </DialogDescription>
          </DialogHeader>
          {editingPurchase && card && (
            <CardPurchaseForm
              key={`${editingPurchase.id}-${editingPurchase.version}`}
              card={card}
              purchase={editingPurchase}
              readOnly={readOnly}
              onCancel={() => setEditingPurchase(null)}
              onSuccess={() => setEditingPurchase(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      {deletingPurchase && card && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingPurchase(null)}
          title="Excluir esta compra?"
          description="O valor será retirado da fatura e o saldo projetado será recalculado."
          confirmText="Excluir compra"
          type="danger"
          isPending={deletePurchase.isPending}
          onConfirm={async () => {
            await deletePurchase.mutateAsync({ cardId: card.id, purchase: deletingPurchase })
            setDeletingPurchase(null)
          }}
        />
      )}
      {closingStatement && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setClosingStatement(null)}
          title="Fechar esta fatura?"
          description="Depois do fechamento, novas compras serão direcionadas ao próximo ciclo."
          confirmText="Fechar fatura"
          type="warning"
          isPending={closeMutation.isPending}
          onConfirm={async () => {
            await closeMutation.mutateAsync(closingStatement)
            setClosingStatement(null)
          }}
        />
      )}
      {reopeningStatement && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setReopeningStatement(null)}
          title="Reabrir esta fatura?"
          description="A fatura voltará a aceitar alterações. Faturas com pagamentos não podem ser reabertas."
          confirmText="Reabrir fatura"
          isPending={reopenMutation.isPending}
          onConfirm={async () => {
            await reopenMutation.mutateAsync(reopeningStatement)
            setReopeningStatement(null)
          }}
        />
      )}
    </div>
  )
}
