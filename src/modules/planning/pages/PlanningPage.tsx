import { FinancialTypeBadge } from '@/components/FinancialTypeBadge'
import {
  ResourceCollectionSkeleton,
  ResourceEmptyState,
} from '@/components/ResourceCollectionState'
import { ResourceErrorState } from '@/components/ResourceErrorState'
import { ResourceMetricCard } from '@/components/ResourceMetricCard'
import { ResourceViewToolbar } from '@/components/ResourceViewToolbar'
import Table from '@/components/Table'
import { civilDateColumn, competenceColumn } from '@/components/Table/columns/date.columns'
import { TooltipButton } from '@/components/TooltipButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useResourceViewMode } from '@/hooks/useResourceViewStore'
import { getDomainLabel } from '@/lib/domain-labels'
import { cn } from '@/lib/utils'
import { useCompetenceMonth } from '@/modules/competence/store/competence.store'
import { formatMoney } from '@/modules/transactions/utils/money'
import {
  getActiveWorkspaceRole,
  workspaceAccessStore,
} from '@/modules/workspaces/store/workspace-access.store'
import { formatCompetencePtBr, formatDatePtBr } from '@/utils/date'
import { filterResources } from '@/utils/resource-search'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import type { ColumnDef } from '@tanstack/react-table'
import {
  CalendarClock,
  CopyPlus,
  Pause,
  Pencil,
  Play,
  ReceiptText,
  Repeat2,
  Target,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { planningApi } from '../api/planning.api'
import { BudgetForm } from '../components/BudgetForm'
import { CreditCardForm } from '../components/CreditCardForm'
import { CreditCardPreview } from '../components/CreditCardPreview'
import { RecurringForm } from '../components/RecurringForm'
import { InstallmentForm } from '../components/ScheduleForms'
import type { Budget, CreditCard, InstallmentPlan, RecurringRule } from '../models/planning.types'
import {
  budgetProgressQuery,
  budgetsQuery,
  cardsQuery,
  installmentsQuery,
  recurringQuery,
  usePlanningMutation,
} from '../queries/planning.queries'

type DialogName = 'budget' | 'recurring' | 'card' | 'installment' | null
export type PlanningSection = 'budgets' | 'recurring' | 'cards' | 'installments'

const sectionContent: Record<PlanningSection, Readonly<{ title: string; description: string }>> = {
  budgets: {
    title: 'Orçamentos',
    description: 'Defina limites por categoria para a competência selecionada.',
  },
  recurring: {
    title: 'Recorrências',
    description: 'Automatize os lançamentos financeiros que se repetem.',
  },
  cards: {
    title: 'Cartões',
    description: 'Gerencie limites, fechamento e vencimento dos cartões.',
  },
  installments: {
    title: 'Parcelamentos',
    description: 'Crie todas as parcelas e competências em uma única ação.',
  },
}

const previousMonth = (month: string) => {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(year, monthNumber - 2, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const recurringTotal = (rules: readonly RecurringRule[], type: RecurringRule['type']) => {
  const totals = new Map<string, number>()
  for (const rule of rules) {
    if (rule.pausedAt || rule.type !== type) continue
    totals.set(rule.currency, (totals.get(rule.currency) ?? 0) + rule.amountCents)
  }
  const formatted = [...totals.entries()].map(([currency, total]) => formatMoney(total, currency))
  return formatted.length > 0 ? formatted.join(' · ') : '0'
}

export const PlanningPage = ({
  section,
  embedded = false,
}: Readonly<{ section: PlanningSection; embedded?: boolean }>) => {
  const navigate = useNavigate()
  const month = useCompetenceMonth()
  const budgets = useQuery({ ...budgetsQuery(month), enabled: section === 'budgets' })
  const budgetProgress = useQuery({
    ...budgetProgressQuery(month),
    enabled: section === 'budgets',
  })
  const recurring = useQuery({ ...recurringQuery(), enabled: section === 'recurring' })
  const cards = useQuery({ ...cardsQuery(), enabled: section === 'cards' })
  const installments = useQuery({
    ...installmentsQuery(),
    enabled: section === 'installments',
  })
  const toggle = usePlanningMutation((rule: RecurringRule) => planningApi.toggleRecurring(rule))
  const readOnly = useStore(workspaceAccessStore, getActiveWorkspaceRole) === 'VIEWER'
  const [dialog, setDialog] = useState<DialogName>(null)
  const [toggleRule, setToggleRule] = useState<RecurringRule | null>(null)
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null)
  const [deletingRule, setDeletingRule] = useState<RecurringRule | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null)
  const [copyingBudgets, setCopyingBudgets] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null)
  const [deletingCard, setDeletingCard] = useState<CreditCard | null>(null)
  const [editingInstallment, setEditingInstallment] = useState<InstallmentPlan | null>(null)
  const [deletingInstallment, setDeletingInstallment] = useState<InstallmentPlan | null>(null)
  const [search, setSearch] = useState('')
  const [budgetView, setBudgetView] = useResourceViewMode('planning-budgets', 'list')
  const [recurringView, setRecurringView] = useResourceViewMode('planning-recurring', 'list')
  const [cardView, setCardView] = useResourceViewMode('planning-cards', 'list')
  const [installmentView, setInstallmentView] = useResourceViewMode('planning-installments', 'list')
  const removeBudget = usePlanningMutation(planningApi.removeBudget)
  const copyBudgets = usePlanningMutation((sourceMonth: string) =>
    planningApi.copyBudgets(sourceMonth, month),
  )
  const removeRecurring = usePlanningMutation(planningApi.removeRecurring)
  const removeCard = usePlanningMutation(planningApi.removeCard)
  const removeInstallment = usePlanningMutation(planningApi.removeInstallments)
  const budgetColumns = useMemo<ColumnDef<Budget>[]>(() => {
    const progressById = new Map(
      (budgetProgress.data?.items ?? []).map((progress) => [progress.id, progress]),
    )
    return [
      {
        id: 'category',
        header: 'Categoria / grupo',
        size: 320,
        cell: ({ row }) => row.original.categoryName,
      },
      competenceColumn<Budget>('month', { header: 'Competência', size: 160 }),
      {
        accessorKey: 'limitCents',
        header: 'Limite',
        size: 180,
        cell: ({ row }) => formatMoney(row.original.limitCents, row.original.currency),
      },
      {
        id: 'realized',
        header: 'Realizado',
        size: 170,
        cell: ({ row }) => {
          const progress = progressById.get(row.original.id)
          return formatMoney(progress?.realizedCents ?? 0, row.original.currency)
        },
      },
      {
        id: 'planned',
        header: 'Planejado',
        size: 170,
        cell: ({ row }) => {
          const progress = progressById.get(row.original.id)
          return formatMoney(progress?.plannedCents ?? 0, row.original.currency)
        },
      },
      {
        id: 'consumption',
        header: 'Consumo',
        size: 130,
        cell: ({ row }) => {
          const consumptionBps = progressById.get(row.original.id)?.consumptionBps
          return consumptionBps === null || consumptionBps === undefined
            ? '—'
            : `${(consumptionBps / 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
        },
      },
      {
        id: 'actions',
        header: 'Ações',
        size: 120,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <TooltipButton
              title="Editar orçamento"
              size="icon"
              variant="ghost"
              disabled={readOnly}
              onClick={() => setEditingBudget(row.original)}
            >
              <Pencil className="size-4" />
            </TooltipButton>
            <TooltipButton
              title="Excluir orçamento"
              size="icon"
              variant="ghost"
              disabled={readOnly}
              onClick={() => setDeletingBudget(row.original)}
            >
              <Trash2 className="text-destructive size-4" />
            </TooltipButton>
          </div>
        ),
      },
    ]
  }, [budgetProgress.data?.items, readOnly])
  const recurringColumns = useMemo<ColumnDef<RecurringRule>[]>(
    () => [
      { accessorKey: 'description', header: 'Descrição', size: 320 },
      {
        accessorKey: 'type',
        header: 'Tipo',
        size: 130,
        cell: ({ row }) => <FinancialTypeBadge type={row.original.type} />,
      },
      {
        accessorKey: 'amountCents',
        header: 'Valor',
        size: 160,
        cell: ({ row }) => (
          <span
            className={
              row.original.type === 'INCOME'
                ? 'font-semibold text-emerald-600 dark:text-emerald-300'
                : 'text-destructive font-semibold'
            }
          >
            {row.original.type === 'INCOME' ? '+' : '−'}{' '}
            {formatMoney(row.original.amountCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'destination',
        header: 'Destino',
        size: 190,
        cell: ({ row }) => row.original.creditCardName ?? 'Conta',
      },
      civilDateColumn<RecurringRule>('nextOccurrenceOn', {
        header: 'Próxima ocorrência',
        size: 180,
      }),
      {
        id: 'status',
        header: 'Situação',
        size: 130,
        cell: ({ row }) => (row.original.pausedAt ? 'Pausada' : 'Ativa'),
      },
      {
        id: 'actions',
        header: 'Ações',
        size: 180,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <TooltipButton
              title={row.original.pausedAt ? 'Retomar recorrência' : 'Pausar recorrência'}
              variant="ghost"
              size="icon"
              disabled={readOnly}
              onClick={() => setToggleRule(row.original)}
            >
              {row.original.pausedAt ? <Play /> : <Pause />}
            </TooltipButton>
            <TooltipButton
              title="Editar recorrência"
              variant="ghost"
              size="icon"
              disabled={readOnly}
              onClick={() => setEditingRule(row.original)}
            >
              <Pencil />
            </TooltipButton>
            <TooltipButton
              title="Excluir recorrência"
              variant="ghost"
              size="icon"
              disabled={readOnly}
              onClick={() => setDeletingRule(row.original)}
            >
              <Trash2 className="text-destructive" />
            </TooltipButton>
          </div>
        ),
      },
    ],
    [readOnly],
  )
  const cardColumns = useMemo<ColumnDef<CreditCard>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Cartão',
        size: 300,
        cell: ({ row }) =>
          `${row.original.name}${row.original.lastFour ? ` •••• ${row.original.lastFour}` : ''}`,
      },
      {
        accessorKey: 'limitCents',
        header: 'Limite',
        size: 180,
        cell: ({ row }) => formatMoney(row.original.limitCents, row.original.currency),
      },
      {
        accessorKey: 'closingDay',
        header: 'Fechamento',
        size: 140,
        cell: ({ row }) => `Dia ${row.original.closingDay}`,
      },
      {
        accessorKey: 'dueDay',
        header: 'Vencimento',
        size: 140,
        cell: ({ row }) => `Dia ${row.original.dueDay}`,
      },
      {
        id: 'actions',
        header: 'Ações',
        size: 160,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <TooltipButton
              title="Gerenciar faturas"
              size="icon"
              variant="ghost"
              onClick={() =>
                void navigate({ to: '/cards/$cardId', params: { cardId: row.original.id } })
              }
            >
              <ReceiptText />
            </TooltipButton>
            <TooltipButton
              title="Editar cartão"
              size="icon"
              variant="ghost"
              disabled={readOnly}
              onClick={() => setEditingCard(row.original)}
            >
              <Pencil />
            </TooltipButton>
            <TooltipButton
              title="Excluir cartão"
              size="icon"
              variant="ghost"
              disabled={readOnly}
              onClick={() => setDeletingCard(row.original)}
            >
              <Trash2 className="text-destructive" />
            </TooltipButton>
          </div>
        ),
      },
    ],
    [navigate, readOnly],
  )
  const installmentColumns = useMemo<ColumnDef<InstallmentPlan>[]>(
    () => [
      { accessorKey: 'description', header: 'Descrição', size: 320 },
      {
        id: 'destination',
        header: 'Destino',
        size: 190,
        cell: ({ row }) => row.original.creditCardName ?? 'Conta',
      },
      {
        accessorKey: 'totalAmountCents',
        header: 'Valor total',
        size: 180,
        cell: ({ row }) => formatMoney(row.original.totalAmountCents, row.original.currency),
      },
      { accessorKey: 'installments', header: 'Parcelas', size: 120 },
      civilDateColumn<InstallmentPlan>('firstDueOn', {
        header: 'Primeiro vencimento',
        size: 180,
      }),
      {
        id: 'actions',
        header: 'Ações',
        size: 120,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <TooltipButton
              title="Editar parcelamento"
              size="icon"
              variant="ghost"
              disabled={readOnly}
              onClick={() => setEditingInstallment(row.original)}
            >
              <Pencil />
            </TooltipButton>
            <TooltipButton
              title={
                row.original.creditCardId
                  ? 'Parcelamentos do cartão são controlados pelas faturas'
                  : 'Excluir parcelamento'
              }
              size="icon"
              variant="ghost"
              disabled={readOnly || Boolean(row.original.creditCardId)}
              onClick={() => setDeletingInstallment(row.original)}
            >
              <Trash2 className="text-destructive" />
            </TooltipButton>
          </div>
        ),
      },
    ],
    [readOnly],
  )
  const table = <T extends { id: string }>(columns: ColumnDef<T>[], data: T[]) => (
    <div className="h-[480px] rounded-xl border">
      <Table<T>
        columns={columns}
        data={data}
        getRowId={(item) => item.id}
        enableRowSelection={false}
        shouldRenderCheckbox={false}
      />
    </div>
  )
  const close = () => setDialog(null)
  const planningSection = section === 'installments' || section === 'budgets'
  const content = planningSection
    ? {
        title: 'Parcelamentos e orçamentos',
        description: 'Organize compras parceladas e limites planejados em um único lugar.',
      }
    : sectionContent[section]
  const filteredBudgets = filterResources(budgets.data?.items ?? [], search)
  const filteredRecurring = filterResources(recurring.data?.items ?? [], search)
  const filteredCards = filterResources(cards.data?.items ?? [], search)
  const filteredInstallments = filterResources(installments.data?.items ?? [], search)

  return (
    <div className="flex flex-col gap-6">
      {!embedded && (
        <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
          <div>
            <h1 className="font-heading text-2xl font-semibold">{content.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{content.description}</p>
          </div>
        </header>
      )}
      {planningSection && !embedded && (
        <Tabs
          value={section}
          onValueChange={(value) =>
            void navigate({
              to: '/installments',
              search: { tab: value === 'budgets' ? 'budgets' : undefined },
            })
          }
        >
          <TabsList className="grid min-h-14 w-full grid-cols-2 p-1.5">
            <TabsTrigger value="installments" className="min-h-11 text-base">
              Parcelamentos
            </TabsTrigger>
            <TabsTrigger value="budgets" className="min-h-11 text-base">
              Orçamentos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      {section === 'budgets' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={filteredBudgets.length}
            label="orçamentos"
            viewMode={budgetView}
            onViewModeChange={setBudgetView}
            onCreate={() => setDialog('budget')}
            createLabel="Novo orçamento"
            createDisabled={readOnly}
            search={{ value: search, onValueChange: setSearch, placeholder: 'Buscar orçamento' }}
            actions={
              <TooltipButton
                title={`Copiar orçamentos de ${formatCompetencePtBr(previousMonth(month))}`}
                size="icon"
                variant="ghost"
                className="size-8"
                disabled={readOnly || (budgets.data?.items.length ?? 0) > 0}
                onClick={() => setCopyingBudgets(true)}
              >
                <CopyPlus className="size-4" />
              </TooltipButton>
            }
          />
          {budgets.isPending ? (
            <ResourceCollectionSkeleton viewMode={budgetView} />
          ) : budgets.isError ? (
            <ResourceErrorState
              compact
              title="Não foi possível carregar os orçamentos"
              error={budgets.error}
              fallbackMessage="Tente carregar os orçamentos novamente."
              onRetry={() => void budgets.refetch()}
              isRetrying={budgets.isFetching}
            />
          ) : budgets.data.items.length === 0 ? (
            <ResourceEmptyState
              title="Nenhum orçamento cadastrado"
              description="Defina um limite por categoria para acompanhar seus gastos da competência."
              actionLabel="Cadastrar orçamento"
              onAction={() => setDialog('budget')}
              actionDisabled={readOnly}
            />
          ) : budgetView === 'list' ? (
            table(budgetColumns, filteredBudgets)
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredBudgets.map((budget) => (
                <Card
                  key={budget.id}
                  className="hover:border-primary/40 flex flex-col justify-between transition-all hover:shadow-xs"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        {formatCompetencePtBr(budget.month)}
                      </span>
                      <span className="text-muted-foreground text-[11px]">{budget.currency}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="text-primary mt-0.5 size-4" />
                      <CardTitle className="truncate text-base">{budget.categoryName}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xl font-semibold">
                    {formatMoney(budget.limitCents, budget.currency)}
                    {(() => {
                      const progress = budgetProgress.data?.items.find(({ id }) => id === budget.id)
                      const percentage = Math.max(
                        0,
                        Math.min(100, (progress?.consumptionBps ?? 0) / 100),
                      )
                      return (
                        <div className="mt-4 space-y-2">
                          <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                            <div
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-muted-foreground text-xs font-normal">
                            {formatMoney(progress?.realizedCents ?? 0, budget.currency)} realizado ·{' '}
                            {formatMoney(progress?.plannedCents ?? 0, budget.currency)} planejado
                          </p>
                        </div>
                      )
                    })()}
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-full"
                      disabled={readOnly}
                      onClick={() => setEditingBudget(budget)}
                    >
                      <Pencil /> Editar
                    </Button>
                    <TooltipButton
                      title="Excluir orçamento"
                      variant="outline"
                      size="icon"
                      className="text-destructive size-8 rounded-full"
                      disabled={readOnly}
                      onClick={() => setDeletingBudget(budget)}
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
      {section === 'recurring' && (
        <section className="space-y-4">
          {recurring.isPending ? (
            <div className="grid grid-cols-2 gap-2" aria-label="Carregando resumo">
              {Array.from({ length: 2 }, (_, index) => (
                <div key={index} className="bg-muted h-[65px] animate-pulse rounded-lg" />
              ))}
            </div>
          ) : recurring.data ? (
            <div className="grid grid-cols-2 gap-2" aria-label="Resumo das recorrências">
              <ResourceMetricCard
                label="Receitas planejadas"
                value={recurringTotal(recurring.data.items, 'INCOME')}
                tone="positive"
              />
              <ResourceMetricCard
                label="Despesas planejadas"
                value={recurringTotal(recurring.data.items, 'EXPENSE')}
                tone="negative"
              />
            </div>
          ) : null}
          <ResourceViewToolbar
            count={filteredRecurring.length}
            label="recorrências"
            viewMode={recurringView}
            onViewModeChange={setRecurringView}
            onCreate={() => setDialog('recurring')}
            createLabel="Nova recorrência"
            createDisabled={readOnly}
            search={{ value: search, onValueChange: setSearch, placeholder: 'Buscar recorrência' }}
          />
          {recurring.isPending ? (
            <ResourceCollectionSkeleton viewMode={recurringView} />
          ) : recurring.isError ? (
            <ResourceErrorState
              compact
              title="Não foi possível carregar as recorrências"
              error={recurring.error}
              fallbackMessage="Tente carregar as recorrências novamente."
              onRetry={() => void recurring.refetch()}
              isRetrying={recurring.isFetching}
            />
          ) : recurring.data.items.length === 0 ? (
            <ResourceEmptyState
              title="Nenhuma recorrência cadastrada"
              description="Cadastre despesas ou receitas repetidas para gerar os próximos lançamentos."
              actionLabel="Cadastrar recorrência"
              onAction={() => setDialog('recurring')}
              actionDisabled={readOnly}
            />
          ) : recurringView === 'list' ? (
            table(recurringColumns, filteredRecurring)
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredRecurring.map((rule) => (
                <Card
                  key={rule.id}
                  className={cn(
                    'flex flex-col justify-between border-l-4 transition-all hover:shadow-xs',
                    rule.type === 'INCOME'
                      ? 'border-l-emerald-500 hover:border-emerald-500'
                      : 'border-l-destructive hover:border-destructive',
                  )}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex justify-between">
                      <FinancialTypeBadge type={rule.type} />
                      <span className="text-muted-foreground text-[11px]">
                        {getDomainLabel(rule.frequency)}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Repeat2
                        className={cn(
                          'mt-0.5 size-4',
                          rule.type === 'INCOME'
                            ? 'text-emerald-600 dark:text-emerald-300'
                            : 'text-destructive',
                        )}
                      />
                      <CardTitle className="truncate text-base">{rule.description}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p
                      className={cn(
                        'text-xl font-semibold',
                        rule.type === 'INCOME'
                          ? 'text-emerald-600 dark:text-emerald-300'
                          : 'text-destructive',
                      )}
                    >
                      {rule.type === 'INCOME' ? '+' : '−'}{' '}
                      {formatMoney(rule.amountCents, rule.currency)}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {rule.pausedAt ? 'Pausada' : 'Ativa'} · próxima em{' '}
                      {formatDatePtBr(rule.nextOccurrenceOn)}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-full"
                      disabled={readOnly}
                      onClick={() => setEditingRule(rule)}
                    >
                      <Pencil /> Editar
                    </Button>
                    <TooltipButton
                      title={rule.pausedAt ? 'Retomar recorrência' : 'Pausar recorrência'}
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-full"
                      disabled={readOnly}
                      onClick={() => setToggleRule(rule)}
                    >
                      {rule.pausedAt ? <Play /> : <Pause />}
                    </TooltipButton>
                    <TooltipButton
                      title="Excluir recorrência"
                      variant="outline"
                      size="icon"
                      className="text-destructive size-8 rounded-full"
                      disabled={readOnly}
                      onClick={() => setDeletingRule(rule)}
                    >
                      <Trash2 />
                    </TooltipButton>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
      {section === 'cards' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={filteredCards.length}
            label="cartões"
            viewMode={cardView}
            onViewModeChange={setCardView}
            onCreate={() => setDialog('card')}
            createLabel="Novo cartão"
            createDisabled={readOnly}
            search={{ value: search, onValueChange: setSearch, placeholder: 'Buscar cartão' }}
          />
          {cards.isPending ? (
            <ResourceCollectionSkeleton viewMode={cardView} />
          ) : cards.isError ? (
            <ResourceErrorState
              compact
              title="Não foi possível carregar os cartões"
              error={cards.error}
              fallbackMessage="Tente carregar seus cartões novamente."
              onRetry={() => void cards.refetch()}
              isRetrying={cards.isFetching}
            />
          ) : cards.data.items.length === 0 ? (
            <ResourceEmptyState
              title="Nenhum cartão cadastrado"
              description="Cadastre um cartão para organizar compras, faturas e vencimentos."
              actionLabel="Cadastrar cartão"
              onAction={() => setDialog('card')}
              actionDisabled={readOnly}
            />
          ) : cardView === 'list' ? (
            table(cardColumns, filteredCards)
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCards.map((card) => (
                <Card
                  key={card.id}
                  className="hover:ring-primary/20 overflow-hidden p-0 transition-all hover:shadow-sm hover:ring-1"
                >
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="sr-only">{card.name}</CardTitle>
                    <CreditCardPreview card={card} />
                  </CardHeader>
                  <CardContent className="px-4 py-3">
                    <p className="text-muted-foreground text-[11px]">Limite</p>
                    <p className="text-lg font-semibold">
                      {formatMoney(card.limitCents, card.currency)}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-1 border-t bg-transparent px-3 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground h-8 flex-1 justify-start"
                      onClick={() =>
                        void navigate({ to: '/cards/$cardId', params: { cardId: card.id } })
                      }
                    >
                      <ReceiptText /> Faturas
                    </Button>
                    <TooltipButton
                      title="Editar cartão"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground size-8"
                      disabled={readOnly}
                      onClick={() => setEditingCard(card)}
                    >
                      <Pencil />
                    </TooltipButton>
                    <TooltipButton
                      title="Excluir cartão"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive size-8"
                      disabled={readOnly}
                      onClick={() => setDeletingCard(card)}
                    >
                      <Trash2 />
                    </TooltipButton>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
      {section === 'installments' && (
        <section className="space-y-4">
          <ResourceViewToolbar
            count={filteredInstallments.length}
            label="parcelamentos"
            viewMode={installmentView}
            onViewModeChange={setInstallmentView}
            onCreate={() => setDialog('installment')}
            createLabel="Novo parcelamento"
            createDisabled={readOnly}
            search={{
              value: search,
              onValueChange: setSearch,
              placeholder: 'Buscar parcelamento',
            }}
          />
          {installments.isPending ? (
            <ResourceCollectionSkeleton viewMode={installmentView} />
          ) : installments.isError ? (
            <ResourceErrorState
              compact
              title="Não foi possível carregar os parcelamentos"
              error={installments.error}
              fallbackMessage="Tente carregar a lista novamente."
              isRetrying={installments.isFetching}
              onRetry={() => void installments.refetch()}
            />
          ) : installments.data.items.length === 0 ? (
            <ResourceEmptyState
              title="Nenhum parcelamento cadastrado"
              description="Cadastre uma compra parcelada para distribuir os lançamentos nas competências."
              actionLabel="Cadastrar parcelamento"
              onAction={() => setDialog('installment')}
              actionDisabled={readOnly}
            />
          ) : installmentView === 'list' ? (
            table(installmentColumns, filteredInstallments)
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredInstallments.map((plan) => (
                <Card
                  key={plan.id}
                  className="hover:border-primary/40 transition-all hover:shadow-xs"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">
                        {plan.installments} parcelas · {plan.creditCardName ?? 'Conta'}
                      </span>
                      <span className="text-muted-foreground text-[11px]">{plan.currency}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CalendarClock className="text-primary mt-0.5 size-4" />
                      <CardTitle className="truncate text-base">{plan.description}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold">
                      {formatMoney(plan.totalAmountCents, plan.currency)}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {plan.creditCardId ? 'Compra em ' : 'Primeira parcela em '}
                      {formatDatePtBr(plan.firstDueOn)}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-full"
                      disabled={readOnly}
                      onClick={() => setEditingInstallment(plan)}
                    >
                      <Pencil /> Editar
                    </Button>
                    <TooltipButton
                      title="Excluir parcelamento"
                      variant="outline"
                      size="icon"
                      className="text-destructive size-8 rounded-full"
                      disabled={readOnly || Boolean(plan.creditCardId)}
                      onClick={() => setDeletingInstallment(plan)}
                    >
                      <Trash2 />
                    </TooltipButton>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
      <Dialog open={dialog !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialog === 'budget'
                ? 'Novo orçamento'
                : dialog === 'recurring'
                  ? 'Nova recorrência'
                  : dialog === 'card'
                    ? 'Novo cartão'
                    : 'Novo parcelamento'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados para adicionar o item às suas finanças.
            </DialogDescription>
          </DialogHeader>
          {dialog === 'budget' && (
            <BudgetForm month={month} readOnly={readOnly} onCancel={close} onSuccess={close} />
          )}
          {dialog === 'recurring' && (
            <RecurringForm readOnly={readOnly} onCancel={close} onSuccess={close} />
          )}
          {dialog === 'card' && (
            <CreditCardForm readOnly={readOnly} onCancel={close} onSuccess={close} />
          )}
          {dialog === 'installment' && (
            <InstallmentForm readOnly={readOnly} onCancel={close} onSuccess={close} />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editingBudget)}
        onOpenChange={(open) => !open && setEditingBudget(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar orçamento</DialogTitle>
            <DialogDescription>Atualize o limite do orçamento selecionado.</DialogDescription>
          </DialogHeader>
          {editingBudget && (
            <BudgetForm
              key={editingBudget.id}
              budget={editingBudget}
              month={month}
              readOnly={readOnly}
              onCancel={() => setEditingBudget(null)}
              onSuccess={() => setEditingBudget(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(editingCard)} onOpenChange={(open) => !open && setEditingCard(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar cartão</DialogTitle>
            <DialogDescription>Atualize os dados do cartão.</DialogDescription>
          </DialogHeader>
          {editingCard && (
            <CreditCardForm
              key={editingCard.id}
              card={editingCard}
              readOnly={readOnly}
              onCancel={() => setEditingCard(null)}
              onSuccess={() => setEditingCard(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(editingRule)} onOpenChange={(open) => !open && setEditingRule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar recorrência</DialogTitle>
            <DialogDescription>Atualize a descrição e o valor da recorrência.</DialogDescription>
          </DialogHeader>
          {editingRule && (
            <RecurringForm
              key={editingRule.id}
              rule={editingRule}
              readOnly={readOnly}
              onCancel={() => setEditingRule(null)}
              onSuccess={() => setEditingRule(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editingInstallment)}
        onOpenChange={(open) => !open && setEditingInstallment(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar parcelamento</DialogTitle>
            <DialogDescription>
              Atualize as parcelas ainda planejadas. A quantidade de parcelas é preservada.
            </DialogDescription>
          </DialogHeader>
          {editingInstallment && (
            <InstallmentForm
              key={editingInstallment.id}
              plan={editingInstallment}
              readOnly={readOnly}
              onCancel={() => setEditingInstallment(null)}
              onSuccess={() => setEditingInstallment(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      {toggleRule && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setToggleRule(null)}
          title={toggleRule.pausedAt ? 'Retomar recorrência?' : 'Pausar recorrência?'}
          description="A alteração afetará as próximas ocorrências geradas."
          confirmText={toggleRule.pausedAt ? 'Retomar' : 'Pausar'}
          type="warning"
          isPending={toggle.isPending}
          onConfirm={async () => {
            await toggle.mutateAsync(toggleRule)
            setToggleRule(null)
          }}
        />
      )}
      {deletingBudget && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingBudget(null)}
          title="Excluir orçamento?"
          description="O limite será removido desta competência."
          confirmText="Excluir orçamento"
          type="danger"
          variant="destructive"
          isPending={removeBudget.isPending}
          onConfirm={async () => {
            await removeBudget.mutateAsync(deletingBudget)
            setDeletingBudget(null)
          }}
        />
      )}
      {copyingBudgets && (
        <ConfirmDialog
          open
          onOpenChange={setCopyingBudgets}
          title="Copiar orçamentos do mês anterior?"
          description={`A estrutura de ${formatCompetencePtBr(previousMonth(month))} será copiada para ${formatCompetencePtBr(month)}. Os valores poderão ser editados depois.`}
          confirmText="Copiar orçamentos"
          type="info"
          isPending={copyBudgets.isPending}
          onConfirm={async () => {
            await copyBudgets.mutateAsync(previousMonth(month))
            setCopyingBudgets(false)
          }}
        />
      )}
      {deletingRule && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingRule(null)}
          title="Excluir recorrência?"
          description="A regra e as ocorrências ainda planejadas serão removidas. Lançamentos já confirmados serão preservados."
          confirmText="Excluir recorrência"
          type="danger"
          variant="destructive"
          isPending={removeRecurring.isPending}
          onConfirm={async () => {
            await removeRecurring.mutateAsync(deletingRule)
            setDeletingRule(null)
          }}
        />
      )}
      {deletingCard && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingCard(null)}
          title="Excluir cartão?"
          description="O cartão será desativado e seu histórico de faturas será preservado."
          confirmText="Excluir cartão"
          type="danger"
          variant="destructive"
          isPending={removeCard.isPending}
          onConfirm={async () => {
            await removeCard.mutateAsync(deletingCard)
            setDeletingCard(null)
          }}
        />
      )}
      {deletingInstallment && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeletingInstallment(null)}
          title="Excluir parcelamento?"
          description="As parcelas ainda planejadas serão removidas. Parcelamentos com parcelas confirmadas não podem ser excluídos."
          confirmText="Excluir parcelamento"
          type="danger"
          variant="destructive"
          isPending={removeInstallment.isPending}
          onConfirm={async () => {
            await removeInstallment.mutateAsync(deletingInstallment)
            setDeletingInstallment(null)
          }}
        />
      )}
    </div>
  )
}
