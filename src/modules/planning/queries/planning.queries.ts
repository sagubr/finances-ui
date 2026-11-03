import { reportKeys } from '@/modules/reports/queries/report.queries'
import { transactionKeys } from '@/modules/transactions/queries/transaction.queries'
import { getActiveWorkspaceUuid } from '@/modules/workspaces/lib/workspace-selection'
import { workspaceAccessStore } from '@/modules/workspaces/store/workspace-access.store'
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { planningApi } from '../api/planning.api'

const workspace = () => workspaceAccessStore.state.activeWorkspaceId
export const planningKeys = {
  root: () => ['planning', workspace()] as const,
  budgets: (month: string) => [...planningKeys.root(), 'budgets', month] as const,
  budgetProgress: (month: string) => [...planningKeys.root(), 'budget-progress', month] as const,
  recurring: () => [...planningKeys.root(), 'recurring'] as const,
  cards: () => [...planningKeys.root(), 'cards'] as const,
  installments: () => [...planningKeys.root(), 'installments'] as const,
  statements: (cardId: string) => [...planningKeys.root(), 'statements', cardId] as const,
  statement: (statementId: string) => [...planningKeys.root(), 'statement', statementId] as const,
  import: (id: string) => [...planningKeys.root(), 'import', id] as const,
}

export const budgetsQuery = (month: string) =>
  queryOptions({ queryKey: planningKeys.budgets(month), queryFn: () => planningApi.budgets(month) })
export const budgetProgressQuery = (month: string) =>
  queryOptions({
    queryKey: planningKeys.budgetProgress(month),
    queryFn: () => planningApi.budgetProgress(month),
  })
export const recurringQuery = () =>
  queryOptions({ queryKey: planningKeys.recurring(), queryFn: planningApi.recurring })
export const cardsQuery = () =>
  queryOptions({ queryKey: planningKeys.cards(), queryFn: planningApi.cards })
export const installmentsQuery = () =>
  queryOptions({ queryKey: planningKeys.installments(), queryFn: planningApi.installments })
export const statementsQuery = (cardId: string) =>
  queryOptions({
    queryKey: planningKeys.statements(cardId),
    queryFn: () => planningApi.statements(cardId),
    enabled: Boolean(cardId),
  })
export const statementQuery = (statementId: string) =>
  queryOptions({
    queryKey: planningKeys.statement(statementId),
    queryFn: () => planningApi.statement(statementId),
    enabled: Boolean(statementId),
  })
export const importQuery = (id: string) =>
  queryOptions({ queryKey: planningKeys.import(id), queryFn: () => planningApi.importBatch(id) })
export const importRowsQuery = (id: string) =>
  queryOptions({
    queryKey: [...planningKeys.import(id), 'rows'],
    queryFn: () => planningApi.importRows(id),
    enabled: Boolean(id),
  })

export const usePlanningMutation = <T, TResult>(mutationFn: (input: T) => Promise<TResult>) => {
  const client = useQueryClient()
  const workspaceId = getActiveWorkspaceUuid()
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: planningKeys.root() }),
        client.invalidateQueries({ queryKey: transactionKeys.all(workspaceId) }),
        client.invalidateQueries({ queryKey: transactionKeys.accounts(workspaceId) }),
        client.invalidateQueries({ queryKey: reportKeys.root(workspaceId) }),
      ])
    },
  })
}

export const useCreateInstallments = () => {
  const client = useQueryClient()
  const workspaceId = getActiveWorkspaceUuid()
  return useMutation({
    mutationFn: planningApi.createInstallments,
    meta: { loadingToast: true, loadingMessage: 'Gerando parcelamento...' },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: planningKeys.root() }),
        client.invalidateQueries({ queryKey: transactionKeys.all(workspaceId) }),
        client.invalidateQueries({ queryKey: transactionKeys.accounts(workspaceId) }),
        client.invalidateQueries({ queryKey: reportKeys.root(workspaceId) }),
      ])
    },
  })
}

export const useCreateCardPurchase = () => {
  const client = useQueryClient()
  const workspaceId = getActiveWorkspaceUuid()
  return useMutation({
    mutationFn: ({
      card,
      input,
    }: {
      card: Parameters<typeof planningApi.createCardPurchase>[0]
      input: Parameters<typeof planningApi.createCardPurchase>[1]
    }) => planningApi.createCardPurchase(card, input),
    meta: { loadingToast: true, loadingMessage: 'Lançando compra no cartão...' },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: planningKeys.root() }),
        client.invalidateQueries({ queryKey: transactionKeys.all(workspaceId) }),
        client.invalidateQueries({ queryKey: transactionKeys.accounts(workspaceId) }),
        client.invalidateQueries({ queryKey: reportKeys.root(workspaceId) }),
      ])
    },
  })
}

export const useUpdateCardPurchase = () =>
  usePlanningMutation(
    ({
      cardId,
      purchase,
      input,
    }: {
      cardId: string
      purchase: Parameters<typeof planningApi.updateCardPurchase>[1]
      input: Parameters<typeof planningApi.updateCardPurchase>[2]
    }) => planningApi.updateCardPurchase(cardId, purchase, input),
  )

export const useDeleteCardPurchase = () =>
  usePlanningMutation(
    ({
      cardId,
      purchase,
    }: {
      cardId: string
      purchase: Parameters<typeof planningApi.deleteCardPurchase>[1]
    }) => planningApi.deleteCardPurchase(cardId, purchase),
  )
