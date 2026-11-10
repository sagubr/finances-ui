import { ApiClientError } from '@/api/api-client.error'
import { MutationErrorMessage } from '@/components/MutationErrorMessage'
import {
  ResourceCollectionSkeleton,
  ResourceEmptyState,
} from '@/components/ResourceCollectionState'
import { ResourceErrorState } from '@/components/ResourceErrorState'
import { ResourceViewToolbar } from '@/components/ResourceViewToolbar'
import Table from '@/components/Table'
import { civilDateColumn } from '@/components/Table/columns/date.columns'
import { TooltipButton } from '@/components/TooltipButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { MoneyInput } from '@/components/ui/money-input'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useResourceViewMode } from '@/hooks/useResourceViewStore'
import {
  getActiveWorkspaceBaseCurrency,
  getActiveWorkspaceRole,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { formatDatePtBr, parseCivilDate, toCivilDate, todayCivilDate } from '@/utils/date'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import type { ColumnDef } from '@tanstack/react-table'
import { Landmark, Pencil, Tags, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { z } from 'zod'
import type { Account, Category } from '../models/transaction.types'
import {
  accountsQueryOptions,
  categoriesQueryOptions,
  useCreateAccount,
  useCreateCategory,
  useRemoveAccount,
  useRemoveCategory,
  useUpdateAccount,
  useUpdateCategory,
} from '../queries/transaction.queries'
import { formatCentsForInput, formatMoney, parseBalanceToCents } from '../utils/money'

const accountSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(['CHECKING', 'SAVINGS', 'CASH', 'BROKERAGE', 'BENEFIT', 'OTHER']),
  currency: z.string().length(3),
  openingBalance: z.string().refine((value) => parseBalanceToCents(value) !== null),
  openingBalanceOn: z.iso.date(),
})
const categorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
})
const accountTypeLabels: Record<Account['type'], string> = {
  CHECKING: 'Conta corrente',
  SAVINGS: 'Poupança',
  CASH: 'Dinheiro',
  BROKERAGE: 'Investimentos',
  BENEFIT: 'Benefício',
  OTHER: 'Outra',
}

const AccountForm = ({
  disabled,
  onCancel,
  onSuccess,
  account,
  baseCurrency,
}: Readonly<{
  disabled: boolean
  onCancel: () => void
  onSuccess: () => void
  account?: Account
  baseCurrency: string
}>) => {
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()
  const mutation = account ? updateMutation : createMutation
  const form = useForm({
    defaultValues: {
      name: account?.name ?? '',
      type: account?.type ?? ('CHECKING' as Account['type']),
      currency: account?.currency ?? baseCurrency,
      openingBalance: account ? formatCentsForInput(account.openingBalanceCents) : '0,00',
      openingBalanceOn: account?.openingBalanceOn ?? todayCivilDate(),
    },
    validators: { onSubmit: accountSchema },
    onSubmit: async ({ value }) => {
      const openingBalanceCents = parseBalanceToCents(value.openingBalance)
      if (openingBalanceCents === null) return
      const input = {
        ...value,
        currency: value.currency.toUpperCase(),
        openingBalanceCents,
      }
      if (account) await updateMutation.mutateAsync({ account, input })
      else await createMutation.mutateAsync(input)
      onSuccess()
    },
  })
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="name">
        {(field) => {
          const invalid = field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={invalid}>
              <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
              <Input
                id={field.name}
                aria-invalid={invalid}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {invalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="type">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Tipo</FieldLabel>
              <SearchableSelect
                id={field.name}
                value={field.state.value}
                disabled={Boolean(account)}
                onValueChange={(value) => field.handleChange(value as Account['type'])}
                options={Object.entries(accountTypeLabels).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </Field>
          )}
        </form.Field>
        <form.Field name="currency">
          {(field) => {
            const invalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={field.name}>Moeda</FieldLabel>
                <Input
                  id={field.name}
                  aria-invalid={invalid}
                  maxLength={3}
                  disabled
                  readOnly
                  value={field.state.value}
                />
                {invalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
        <form.Field name="openingBalance">
          {(field) => {
            const invalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor={field.name}>Saldo inicial</FieldLabel>
                <MoneyInput
                  id={field.name}
                  aria-invalid={invalid}
                  allowNegative
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onValueChange={field.handleChange}
                />
                {invalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
        <form.Field name="openingBalanceOn">
          {(field) => (
            <Field>
              <FieldLabel>Data do saldo</FieldLabel>
              <DatePicker
                value={parseCivilDate(field.state.value)}
                onChange={(value) => value && field.handleChange(toCivilDate(value))}
              />
            </Field>
          )}
        </form.Field>
      </div>
      {mutation.error && (
        <FieldError>
          {mutation.error instanceof ApiClientError
            ? mutation.error.message
            : 'Falha ao criar conta.'}
        </FieldError>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={disabled || mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : account ? 'Salvar alterações' : 'Criar conta'}
        </Button>
      </DialogFooter>
    </form>
  )
}

const CategoryForm = ({
  disabled,
  onCancel,
  onSuccess,
  category,
}: Readonly<{
  disabled: boolean
  onCancel: () => void
  onSuccess: () => void
  category?: Category
}>) => {
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const mutation = category ? updateMutation : createMutation
  const form = useForm({
    defaultValues: {
      name: category?.name ?? '',
      type: category?.type ?? ('EXPENSE' as Category['type']),
      color: category?.color ?? '#64748B',
    },
    validators: { onSubmit: categorySchema },
    onSubmit: async ({ value }) => {
      if (category) await updateMutation.mutateAsync({ category, input: value })
      else await createMutation.mutateAsync(value)
      onSuccess()
    },
  })
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="name">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={`category-${field.name}`}>Nome</FieldLabel>
            <Input
              id={`category-${field.name}`}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <form.Field name="type">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Tipo</FieldLabel>
              <SearchableSelect
                id={field.name}
                value={field.state.value}
                disabled={Boolean(category)}
                onValueChange={(value) => field.handleChange(value as Category['type'])}
                options={[
                  { value: 'EXPENSE', label: 'Despesa' },
                  { value: 'INCOME', label: 'Receita' },
                ]}
              />
            </Field>
          )}
        </form.Field>
        <form.Field name="color">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={`category-${field.name}`}>Cor</FieldLabel>
              <Input
                id={`category-${field.name}`}
                type="color"
                className="w-16"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </Field>
          )}
        </form.Field>
      </div>
      <MutationErrorMessage
        error={mutation.error}
        fallbackMessage="Não foi possível salvar a categoria."
      />
      <DialogFooter>
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={disabled || mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : category ? 'Salvar alterações' : 'Criar categoria'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export type FinancialStructureSection = 'accounts' | 'categories'

const sectionMetadata: Record<
  FinancialStructureSection,
  Readonly<{ title: string; description: string }>
> = {
  accounts: {
    title: 'Contas',
    description: 'Gerencie contas financeiras, moedas e saldos iniciais.',
  },
  categories: {
    title: 'Categorias',
    description: 'Organize as categorias utilizadas em receitas e despesas.',
  },
}

export const FinancialStructurePage = ({
  section,
  embedded = false,
}: Readonly<{ section: FinancialStructureSection; embedded?: boolean }>) => {
  const accounts = useQuery({ ...accountsQueryOptions(), enabled: section === 'accounts' })
  const categories = useQuery({
    ...categoriesQueryOptions(),
    enabled: section === 'categories',
  })
  const isReadOnly = useStore(workspaceAccessStore, getActiveWorkspaceRole) === 'VIEWER'
  const baseCurrency = useStore(workspaceAccessStore, getActiveWorkspaceBaseCurrency)
  const [accountOpen, setAccountOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [accountView, setAccountView] = useResourceViewMode('accounts', 'list')
  const [categoryView, setCategoryView] = useResourceViewMode('categories', 'list')
  const removeAccount = useRemoveAccount()
  const removeCategory = useRemoveCategory()
  const accountColumns = useMemo<ColumnDef<Account>[]>(
    () => [
      { accessorKey: 'name', header: 'Conta', size: 280 },
      {
        accessorKey: 'type',
        header: 'Tipo',
        size: 180,
        cell: ({ row }) => accountTypeLabels[row.original.type],
      },
      { accessorKey: 'currency', header: 'Moeda', size: 100 },
      {
        accessorKey: 'currentBalanceCents',
        header: 'Saldo atual',
        size: 160,
        cell: ({ row }) => (
          <span className={row.original.currentBalanceCents < 0 ? 'text-destructive' : ''}>
            {formatMoney(row.original.currentBalanceCents, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'projectedBalanceCents',
        header: 'Saldo projetado',
        size: 170,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatMoney(row.original.projectedBalanceCents, row.original.currency)}
          </span>
        ),
      },
      civilDateColumn<Account>('openingBalanceOn', { header: 'Base em', size: 140 }),
      {
        id: 'actions',
        header: 'Ações',
        size: 120,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <TooltipButton
              title="Editar conta"
              size="icon"
              variant="ghost"
              disabled={isReadOnly}
              onClick={() => setEditingAccount(row.original)}
            >
              <Pencil className="size-4" />
            </TooltipButton>
            <TooltipButton
              title="Excluir conta"
              size="icon"
              variant="ghost"
              disabled={isReadOnly}
              onClick={() => setDeletingAccount(row.original)}
            >
              <Trash2 className="text-destructive size-4" />
            </TooltipButton>
          </div>
        ),
      },
    ],
    [isReadOnly],
  )
  const categoryColumns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Categoria',
        size: 320,
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: row.original.color ?? '#64748B' }}
            />
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        size: 160,
        cell: ({ row }) => (row.original.type === 'INCOME' ? 'Receita' : 'Despesa'),
      },
      {
        accessorKey: 'isDefault',
        header: 'Origem',
        size: 140,
        cell: ({ row }) => (row.original.isDefault ? 'Padrão' : 'Personalizada'),
      },
      {
        id: 'actions',
        header: 'Ações',
        size: 120,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <TooltipButton
              title="Editar categoria"
              size="icon"
              variant="ghost"
              disabled={isReadOnly || row.original.isDefault}
              onClick={() => setEditingCategory(row.original)}
            >
              <Pencil className="size-4" />
            </TooltipButton>
            <TooltipButton
              title="Excluir categoria"
              size="icon"
              variant="ghost"
              disabled={isReadOnly || row.original.isDefault}
              onClick={() => setDeletingCategory(row.original)}
            >
              <Trash2 className="text-destructive size-4" />
            </TooltipButton>
          </div>
        ),
      },
    ],
    [isReadOnly],
  )
  const metadata = sectionMetadata[section]
  return (
    <div className="flex flex-col gap-6">
      {!embedded && (
        <header className="border-b pb-5">
          <h1 className="font-heading text-2xl font-semibold">{metadata.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{metadata.description}</p>
        </header>
      )}
      {section === 'accounts' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={accounts.data?.items.length ?? 0}
            label="contas cadastradas"
            viewMode={accountView}
            onViewModeChange={setAccountView}
            onCreate={() => setAccountOpen(true)}
            createLabel="Nova conta"
            createDisabled={isReadOnly}
          />
          {accounts.isPending ? (
            <ResourceCollectionSkeleton viewMode={accountView} />
          ) : accounts.isError ? (
            <ResourceErrorState
              title="Não foi possível carregar as contas"
              error={accounts.error}
              fallbackMessage="Tente carregar suas contas novamente."
              onRetry={() => void accounts.refetch()}
              isRetrying={accounts.isFetching}
              compact
            />
          ) : accounts.data.items.length === 0 ? (
            <ResourceEmptyState
              title="Nenhuma conta cadastrada"
              description="Cadastre sua primeira conta para começar a acompanhar saldos e lançamentos."
              actionLabel="Cadastrar conta"
              onAction={() => setAccountOpen(true)}
              actionDisabled={isReadOnly}
            />
          ) : accountView === 'list' ? (
            <div className="h-[520px] rounded-xl border">
              <Table<Account>
                columns={accountColumns}
                data={Array.from(accounts.data?.items ?? [])}
                getRowId={(item) => item.id}
                enableRowSelection={false}
                shouldRenderCheckbox={false}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {accounts.data?.items.map((account) => (
                <Card
                  key={account.id}
                  className="hover:border-primary/40 flex flex-col justify-between transition-all hover:shadow-xs"
                >
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        {accountTypeLabels[account.type]}
                      </span>
                      <span className="text-muted-foreground text-[11px]">{account.currency}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Landmark className="text-primary mt-0.5 size-4" />
                      <CardTitle className="text-base">{account.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xl font-semibold">
                      {formatMoney(account.currentBalanceCents, account.currency)}
                    </p>
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>Saldo projetado</span>
                      <span className="font-medium">
                        {formatMoney(account.projectedBalanceCents, account.currency)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Base de {formatMoney(account.openingBalanceCents, account.currency)} em{' '}
                      {formatDatePtBr(account.openingBalanceOn)}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-full"
                      disabled={isReadOnly}
                      onClick={() => setEditingAccount(account)}
                    >
                      <Pencil /> Editar
                    </Button>
                    <TooltipButton
                      title="Excluir conta"
                      variant="outline"
                      size="icon"
                      className="text-destructive size-8 rounded-full"
                      disabled={isReadOnly}
                      onClick={() => setDeletingAccount(account)}
                    >
                      <Trash2 className="size-3.5" />
                    </TooltipButton>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
      {section === 'categories' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={categories.data?.items.length ?? 0}
            label="categorias cadastradas"
            viewMode={categoryView}
            onViewModeChange={setCategoryView}
            onCreate={() => setCategoryOpen(true)}
            createLabel="Nova categoria"
            createDisabled={isReadOnly}
          />
          {categories.isPending ? (
            <ResourceCollectionSkeleton viewMode={categoryView} />
          ) : categories.isError ? (
            <ResourceErrorState
              title="Não foi possível carregar as categorias"
              error={categories.error}
              fallbackMessage="Tente carregar suas categorias novamente."
              onRetry={() => void categories.refetch()}
              isRetrying={categories.isFetching}
              compact
            />
          ) : categories.data.items.length === 0 ? (
            <ResourceEmptyState
              title="Nenhuma categoria cadastrada"
              description="Cadastre categorias para organizar receitas e despesas nos relatórios."
              actionLabel="Cadastrar categoria"
              onAction={() => setCategoryOpen(true)}
              actionDisabled={isReadOnly}
            />
          ) : categoryView === 'list' ? (
            <div className="h-[520px] rounded-xl border">
              <Table<Category>
                columns={categoryColumns}
                data={Array.from(categories.data?.items ?? [])}
                getRowId={(item) => item.id}
                enableRowSelection={false}
                shouldRenderCheckbox={false}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {categories.data?.items.map((category) => (
                <Card
                  key={category.id}
                  className="hover:border-primary/40 transition-all hover:shadow-xs"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: category.color ?? '#64748B' }}
                      />
                      <span className="text-muted-foreground text-[11px]">
                        {category.isDefault ? 'Padrão' : 'Personalizada'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Tags className="text-primary mt-0.5 size-4" />
                      <CardTitle className="text-base">{category.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    {category.type === 'INCOME' ? 'Receita' : 'Despesa'}
                  </CardContent>
                  {!category.isDefault && (
                    <CardFooter className="flex gap-2 border-t pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 flex-1 rounded-full"
                        disabled={isReadOnly}
                        onClick={() => setEditingCategory(category)}
                      >
                        <Pencil /> Editar
                      </Button>
                      <TooltipButton
                        title="Excluir categoria"
                        variant="outline"
                        size="icon"
                        className="text-destructive size-8 rounded-full"
                        disabled={isReadOnly}
                        onClick={() => setDeletingCategory(category)}
                      >
                        <Trash2 className="size-3.5" />
                      </TooltipButton>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Nova conta</DialogTitle>
            <DialogDescription>
              Cadastre uma conta financeira neste espaço financeiro.
            </DialogDescription>
          </DialogHeader>
          {baseCurrency ? (
            <AccountForm
              baseCurrency={baseCurrency}
              disabled={isReadOnly}
              onCancel={() => setAccountOpen(false)}
              onSuccess={() => setAccountOpen(false)}
            />
          ) : (
            <p className="text-muted-foreground py-4 text-sm">Carregando moeda do workspace…</p>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editingAccount)}
        onOpenChange={(open) => !open && setEditingAccount(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar conta</DialogTitle>
            <DialogDescription>Atualize os dados da conta financeira.</DialogDescription>
          </DialogHeader>
          {editingAccount && baseCurrency && (
            <AccountForm
              key={editingAccount.id}
              account={editingAccount}
              baseCurrency={baseCurrency}
              disabled={isReadOnly}
              onCancel={() => setEditingAccount(null)}
              onSuccess={() => setEditingAccount(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova categoria</DialogTitle>
            <DialogDescription>Organize receitas e despesas com uma categoria.</DialogDescription>
          </DialogHeader>
          <CategoryForm
            disabled={isReadOnly}
            onCancel={() => setCategoryOpen(false)}
            onSuccess={() => setCategoryOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
            <DialogDescription>Atualize os dados da categoria financeira.</DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              key={editingCategory.id}
              category={editingCategory}
              disabled={isReadOnly}
              onCancel={() => setEditingCategory(null)}
              onSuccess={() => setEditingCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      {deletingAccount && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingAccount(null)}
          title="Excluir conta?"
          description="A conta será desativada e deixará de aceitar novos lançamentos."
          confirmText="Excluir conta"
          type="danger"
          variant="destructive"
          isPending={removeAccount.isPending}
          onConfirm={async () => {
            await removeAccount.mutateAsync(deletingAccount)
            setDeletingAccount(null)
          }}
        />
      )}
      {deletingCategory && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingCategory(null)}
          title="Excluir categoria?"
          description="A categoria deixará de aparecer em novos lançamentos. O histórico será preservado."
          confirmText="Excluir categoria"
          type="danger"
          variant="destructive"
          isPending={removeCategory.isPending}
          onConfirm={async () => {
            await removeCategory.mutateAsync(deletingCategory)
            setDeletingCategory(null)
          }}
        />
      )}
    </div>
  )
}
