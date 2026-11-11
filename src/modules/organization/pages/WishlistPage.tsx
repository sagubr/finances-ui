import {
  ResourceCollectionSkeleton,
  ResourceEmptyState,
} from '@/components/ResourceCollectionState'
import { ResourceErrorState } from '@/components/ResourceErrorState'
import { ResourceMetricCard } from '@/components/ResourceMetricCard'
import { ResourceViewToolbar } from '@/components/ResourceViewToolbar'
import Table from '@/components/Table'
import { TooltipButton } from '@/components/TooltipButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DatePicker, DateRangePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { MoneyInput } from '@/components/ui/money-input'
import { PlayfulCheckbox } from '@/components/ui/playful-todolist'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Switch } from '@/components/ui/switch'
import { useResourceViewMode } from '@/hooks/useResourceViewStore'
import { getDomainLabel } from '@/lib/domain-labels'
import { formatCentsForInput, parseMoneyToCents } from '@/lib/money'
import { useCompetenceMonth } from '@/modules/competence/store/competence.store'
import {
  accountsQueryOptions,
  categoriesQueryOptions,
} from '@/modules/transactions/queries/transaction.queries'
import { formatMoney } from '@/modules/transactions/utils/money'
import {
  getActiveWorkspaceRole,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { formatDatePtBr, parseCivilDate, toCivilDate, todayCivilDate } from '@/utils/date'
import { filterResources } from '@/utils/resource-search'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { organizationApi } from '../api/organization.api'
import { WishlistForm } from '../components/OrganizationForms'
import type { WishlistFilters, WishlistItem } from '../models/organization.types'
import {
  useOrganizationMutation,
  wishlistQuery,
  wishlistSummaryQuery,
} from '../queries/organization.queries'

type WishlistPageProps = Readonly<{
  filters: WishlistFilters
  onFiltersChange: (filters: WishlistFilters) => void
}>

const PurchaseForm = ({
  item,
  onCancel,
  onSuccess,
}: Readonly<{ item: WishlistItem; onCancel: () => void; onSuccess: () => void }>) => {
  const accounts = useQuery(accountsQueryOptions())
  const categories = useQuery(categoriesQueryOptions())
  const mutation = useOrganizationMutation(
    (input: Parameters<typeof organizationApi.purchaseWishlistItem>[1]) =>
      organizationApi.purchaseWishlistItem(item, input),
  )
  const queryClient = useQueryClient()
  const [createTransaction, setCreateTransaction] = useState(true)
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState(formatCentsForInput(item.estimatedPriceCents))
  const [purchasedOn, setPurchasedOn] = useState(todayCivilDate())
  const amountCents = parseMoneyToCents(amount)
  const accountItems = (accounts.data?.items ?? []).filter(
    (account) => account.active && account.currency === item.currency,
  )
  const categoryItems = (categories.data?.items ?? []).filter(
    (category) => category.active && category.type === 'EXPENSE',
  )
  const canSubmit =
    amountCents !== null &&
    amountCents > 0 &&
    purchasedOn.length > 0 &&
    (!createTransaction || (accountId.length > 0 && categoryId.length > 0))

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!canSubmit || amountCents === null) return
        void mutation
          .mutateAsync({
            createTransaction,
            accountId: createTransaction ? accountId : undefined,
            categoryId: createTransaction ? categoryId : undefined,
            amountCents,
            purchasedOn,
          })
          .then(async () => {
            if (createTransaction) {
              await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['transactions'] }),
                queryClient.invalidateQueries({ queryKey: ['accounts'] }),
                queryClient.invalidateQueries({ queryKey: ['reports'] }),
              ])
            }
            onSuccess()
          })
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="wishlist-purchase-amount">Valor pago</FieldLabel>
          <MoneyInput id="wishlist-purchase-amount" value={amount} onValueChange={setAmount} />
        </Field>
        <Field>
          <FieldLabel htmlFor="wishlist-purchase-date">Data da compra</FieldLabel>
          <DatePicker
            value={purchasedOn ? parseCivilDate(purchasedOn) : undefined}
            onChange={(value) => setPurchasedOn(value ? toCivilDate(value) : '')}
            placeholder="Selecione a data"
            enableYearNavigation
          />
        </Field>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-xl border p-3 text-sm">
        <span>
          <FieldLabel htmlFor="wishlist-create-transaction">Criar despesa</FieldLabel>
          <span className="text-muted-foreground">
            Registra a compra também nas transações financeiras.
          </span>
        </span>
        <Switch
          id="wishlist-create-transaction"
          checked={createTransaction}
          onCheckedChange={setCreateTransaction}
        />
      </div>
      {createTransaction && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="wishlist-purchase-account">Conta</FieldLabel>
            <SearchableSelect
              id="wishlist-purchase-account"
              value={accountId}
              onValueChange={setAccountId}
              placeholder={`Conta em ${item.currency}`}
              options={accountItems.map((account) => ({
                value: account.id,
                label: account.name,
                badge: account.currency,
              }))}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="wishlist-purchase-category">Categoria de despesa</FieldLabel>
            <SearchableSelect
              id="wishlist-purchase-category"
              value={categoryId}
              onValueChange={setCategoryId}
              placeholder="Selecione a categoria"
              options={categoryItems.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
            />
          </Field>
        </div>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSubmit || mutation.isPending}>
          {mutation.isPending
            ? 'Registrando…'
            : createTransaction
              ? 'Registrar compra e despesa'
              : 'Registrar somente a compra'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export const WishlistPage = ({ filters, onFiltersChange }: WishlistPageProps) => {
  const month = useCompetenceMonth()
  const wishlist = useQuery(wishlistQuery(filters))
  const summary = useQuery(wishlistSummaryQuery(month))
  const readOnly = useStore(workspaceAccessStore, getActiveWorkspaceRole) === 'VIEWER'
  const [viewMode, setViewMode] = useResourceViewMode('organization-wishlist', 'list')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<WishlistItem | null>(null)
  const [archiving, setArchiving] = useState<WishlistItem | null>(null)
  const [purchasing, setPurchasing] = useState<WishlistItem | null>(null)
  const archive = useOrganizationMutation(organizationApi.archiveWishlistItem)
  const items = filterResources(wishlist.data?.items ?? [], search)

  const columns = useMemo<ColumnDef<WishlistItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Desejo',
        size: 300,
        cell: ({ row }) => (
          <div className="min-w-0">
            <PlayfulCheckbox
              id={`wishlist-row-${row.original.id}`}
              label={row.original.name}
              checked={row.original.status === 'PURCHASED'}
              disabled={readOnly || row.original.status !== 'PLANNED'}
              onCheckedChange={(checked) => checked && setPurchasing(row.original)}
            />
            {row.original.reason && (
              <p className="text-muted-foreground mt-1 truncate pl-8 text-xs">
                {row.original.reason}
              </p>
            )}
          </div>
        ),
      },
      {
        id: 'estimate',
        header: 'Estimativa',
        size: 160,
        cell: ({ row }) =>
          row.original.estimatedPriceCents
            ? formatMoney(row.original.estimatedPriceCents, row.original.currency)
            : '—',
      },
      {
        accessorKey: 'priority',
        header: 'Prioridade',
        size: 110,
      },
      {
        id: 'plannedOn',
        header: 'Planejado para',
        size: 150,
        cell: ({ row }) => (row.original.plannedOn ? formatDatePtBr(row.original.plannedOn) : '—'),
      },
      {
        accessorKey: 'status',
        header: 'Situação',
        size: 130,
        cell: ({ row }) => getDomainLabel(row.original.status),
      },
      {
        id: 'actions',
        header: 'Ações',
        size: 150,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <TooltipButton
              title="Editar desejo"
              variant="ghost"
              size="icon"
              disabled={readOnly || row.original.status !== 'PLANNED'}
              onClick={() => setEditing(row.original)}
            >
              <Pencil />
            </TooltipButton>
            <TooltipButton
              title="Arquivar desejo"
              variant="ghost"
              size="icon"
              disabled={readOnly}
              onClick={() => setArchiving(row.original)}
            >
              <Trash2 className="text-destructive" />
            </TooltipButton>
          </div>
        ),
      },
    ],
    [readOnly],
  )

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="border-b pb-5">
        <h1 className="font-heading text-2xl font-semibold">Lista de desejos</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Planeje compras e transforme uma conquista em despesa quando ela acontecer.
        </p>
      </header>

      {summary.data && summary.data.totals.length > 0 && (
        <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3" aria-label="Resumo planejado">
          {summary.data.totals.map((total) => (
            <ResourceMetricCard
              key={total.currency}
              label={`${total.itemCount} ${total.itemCount === 1 ? 'desejo' : 'desejos'} em ${total.currency}`}
              value={formatMoney(total.totalCents, total.currency)}
            />
          ))}
        </section>
      )}

      <section className="space-y-4">
        <ResourceViewToolbar
          count={items.length}
          label="desejos"
          singularLabel="desejo"
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreate={() => setCreateOpen(true)}
          createLabel="Novo desejo"
          createDisabled={readOnly}
          search={{ value: search, onValueChange: setSearch, placeholder: 'Buscar desejo' }}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <SearchableSelect
            aria-label="Filtrar por situação"
            value={filters.status ?? 'ALL'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value === 'ALL' ? undefined : (value as WishlistItem['status']),
              })
            }
            options={[
              { value: 'ALL', label: 'Todas as situações' },
              { value: 'PLANNED', label: 'Planejados' },
              { value: 'PURCHASE_PENDING', label: 'Compra em processamento' },
              { value: 'PURCHASED', label: 'Comprados' },
              { value: 'ARCHIVED', label: 'Arquivados' },
            ]}
          />
          <DateRangePicker
            value={
              filters.from
                ? {
                    from: parseCivilDate(filters.from),
                    to: filters.to ? parseCivilDate(filters.to) : undefined,
                  }
                : undefined
            }
            onChange={(range) =>
              onFiltersChange({
                ...filters,
                from: range?.from ? toCivilDate(range.from) : undefined,
                to: range?.to ? toCivilDate(range.to) : undefined,
              })
            }
            placeholder="Filtrar por período"
            enableYearNavigation
          />
          <SearchableSelect
            aria-label="Filtrar por prioridade"
            value={filters.priority === undefined ? 'ALL' : String(filters.priority)}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                priority: value === 'ALL' ? undefined : Number(value),
              })
            }
            options={[
              { value: 'ALL', label: 'Todas as prioridades' },
              ...Array.from({ length: 11 }, (_, priority) => ({
                value: String(priority),
                label: `Prioridade ${priority}`,
              })),
            ]}
          />
        </div>

        {wishlist.isPending ? (
          <ResourceCollectionSkeleton viewMode={viewMode} />
        ) : wishlist.isError ? (
          <ResourceErrorState
            compact
            title="Não foi possível carregar a lista de desejos"
            error={wishlist.error}
            fallbackMessage="Tente carregar seus desejos novamente."
            onRetry={() => void wishlist.refetch()}
            isRetrying={wishlist.isFetching}
          />
        ) : items.length === 0 ? (
          <ResourceEmptyState
            title={
              search || Object.values(filters).some(Boolean)
                ? 'Nenhum desejo encontrado'
                : 'Nenhum desejo cadastrado'
            }
            description={
              search || Object.values(filters).some(Boolean)
                ? 'Altere a busca ou os filtros para encontrar outros itens.'
                : 'Cadastre um desejo para planejar sua próxima conquista.'
            }
            actionLabel={
              !search && !Object.values(filters).some(Boolean) ? 'Cadastrar desejo' : undefined
            }
            onAction={
              !search && !Object.values(filters).some(Boolean)
                ? () => setCreateOpen(true)
                : undefined
            }
            actionDisabled={readOnly}
          />
        ) : viewMode === 'list' ? (
          <div className="h-[520px] rounded-xl border">
            <Table
              columns={columns}
              data={items}
              getRowId={(item) => item.id}
              enableRowSelection={false}
              shouldRenderCheckbox={false}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="flex flex-col justify-between">
                <CardHeader className="space-y-3">
                  <div className="flex justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">{getDomainLabel(item.status)}</span>
                    <span className="text-muted-foreground">Prioridade {item.priority}</span>
                  </div>
                  <CardTitle className="text-base">
                    <PlayfulCheckbox
                      id={`wishlist-card-${item.id}`}
                      label={item.name}
                      checked={item.status === 'PURCHASED'}
                      disabled={readOnly || item.status !== 'PLANNED'}
                      onCheckedChange={(checked) => checked && setPurchasing(item)}
                      labelClassName="text-base"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xl font-semibold">
                    {item.estimatedPriceCents
                      ? formatMoney(item.estimatedPriceCents, item.currency)
                      : 'Sem estimativa'}
                  </p>
                  {item.reason && <p className="text-muted-foreground text-sm">{item.reason}</p>}
                  {item.plannedOn && (
                    <p className="text-muted-foreground text-xs">
                      Planejado para {formatDatePtBr(item.plannedOn)}
                    </p>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
                    >
                      Abrir link <ExternalLink className="size-3.5" />
                    </a>
                  )}
                  {item.transactionId && (
                    <p className="text-muted-foreground text-xs">
                      Despesa vinculada: {item.transactionId.slice(0, 8)}…
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2 border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 rounded-full"
                    disabled={readOnly || item.status !== 'PLANNED'}
                    onClick={() => setEditing(item)}
                  >
                    <Pencil /> Editar
                  </Button>
                  <TooltipButton
                    title="Arquivar desejo"
                    variant="outline"
                    size="icon"
                    className="text-destructive size-8 rounded-full"
                    disabled={readOnly}
                    onClick={() => setArchiving(item)}
                  >
                    <Trash2 />
                  </TooltipButton>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={createOpen || Boolean(editing)}
        onOpenChange={(open) => !open && (setCreateOpen(false), setEditing(null))}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar desejo' : 'Novo desejo'}</DialogTitle>
            <DialogDescription>
              Informe os dados da compra que você deseja planejar.
            </DialogDescription>
          </DialogHeader>
          <WishlistForm
            key={editing?.id ?? 'create'}
            item={editing ?? undefined}
            readOnly={readOnly}
            onCancel={() => (setCreateOpen(false), setEditing(null))}
            onSuccess={() => (setCreateOpen(false), setEditing(null))}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(purchasing)} onOpenChange={(open) => !open && setPurchasing(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Registrar compra</DialogTitle>
            <DialogDescription>
              Confirme o valor e escolha se a compra também deve virar uma despesa.
            </DialogDescription>
          </DialogHeader>
          {purchasing && (
            <PurchaseForm
              key={purchasing.id}
              item={purchasing}
              onCancel={() => setPurchasing(null)}
              onSuccess={() => setPurchasing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {archiving && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setArchiving(null)}
          title="Arquivar desejo?"
          description="O item continuará disponível pelo filtro de arquivados e o vínculo com a despesa será preservado."
          confirmText="Arquivar"
          type="danger"
          variant="destructive"
          isPending={archive.isPending}
          onConfirm={async () => {
            await archive.mutateAsync(archiving)
            setArchiving(null)
          }}
        />
      )}
    </div>
  )
}
