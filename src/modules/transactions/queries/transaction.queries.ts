import { reportKeys } from '@/modules/reports/queries/report.queries'
import { getActiveWorkspaceUuid } from '@/modules/workspaces/lib/workspace-selection'
import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { transactionsApi } from '../api/transactions.api'
import type {
  Account,
  Category,
  CreateAccountInput,
  CreateCategoryInput,
  CreateTransactionInput,
  CreateTransferInput,
  Transaction,
  TransactionFilters,
  UpdateTransactionInput,
} from '../models/transaction.types'

export const transactionKeys = {
  all: (workspaceId: string) => ['transactions', workspaceId] as const,
  lists: (workspaceId: string) => [...transactionKeys.all(workspaceId), 'list'] as const,
  list: (workspaceId: string, filters: TransactionFilters) =>
    [...transactionKeys.lists(workspaceId), filters] as const,
  summary: (workspaceId: string, month: string) =>
    [...transactionKeys.all(workspaceId), 'summary', month] as const,
  accounts: (workspaceId: string) => ['accounts', workspaceId, 'list'] as const,
  categories: (workspaceId: string) => ['categories', workspaceId, 'list'] as const,
}

export const accountsQueryOptions = (workspaceId = getActiveWorkspaceUuid()) =>
  queryOptions({
    queryKey: transactionKeys.accounts(workspaceId),
    queryFn: () => transactionsApi.listAccounts(),
    enabled: Boolean(workspaceId),
    staleTime: 60_000,
  })

export const categoriesQueryOptions = (workspaceId = getActiveWorkspaceUuid()) =>
  queryOptions({
    queryKey: transactionKeys.categories(workspaceId),
    queryFn: () => transactionsApi.listCategories(),
    enabled: Boolean(workspaceId),
    staleTime: 60_000,
  })

export const transactionsQueryOptions = (
  filters: TransactionFilters,
  workspaceId = getActiveWorkspaceUuid(),
) =>
  infiniteQueryOptions({
    queryKey: transactionKeys.list(workspaceId, filters),
    queryFn: ({ pageParam }) => transactionsApi.list(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: ({ pageInfo }) => pageInfo.nextCursor ?? undefined,
    enabled: Boolean(workspaceId),
  })

export const monthlySummaryQueryOptions = (month: string, workspaceId = getActiveWorkspaceUuid()) =>
  queryOptions({
    queryKey: transactionKeys.summary(workspaceId, month),
    queryFn: () => transactionsApi.monthlySummary(month),
    enabled: Boolean(workspaceId && month),
  })

export const useCreateTransaction = (workspaceId = getActiveWorkspaceUuid()) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTransactionInput) => transactionsApi.create(input),
    meta: { loadingToast: true, loadingMessage: 'Salvando transação...' },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.lists(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: transactionKeys.all(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: transactionKeys.accounts(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: reportKeys.root(workspaceId) }),
      ])
    },
  })
}
export const useCreateTransfer = (workspaceId = getActiveWorkspaceUuid()) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTransferInput) => transactionsApi.createTransfer(input),
    meta: { loadingToast: true, loadingMessage: 'Salvando transferência...' },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.all(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: transactionKeys.accounts(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: reportKeys.root(workspaceId) }),
      ])
    },
  })
}

export const useUpdateTransaction = (workspaceId = getActiveWorkspaceUuid()) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTransactionInput }) =>
      transactionsApi.update(id, input),
    meta: { loadingToast: true, loadingMessage: 'Atualizando transação...' },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.all(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: transactionKeys.accounts(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: reportKeys.root(workspaceId) }),
      ])
    },
  })
}

type TransactionAction = 'confirm' | 'settle' | 'revert' | 'remove'
const transactionActions = {
  confirm: transactionsApi.confirm,
  settle: transactionsApi.settle,
  revert: transactionsApi.revertStatus,
  remove: transactionsApi.remove,
} satisfies Record<TransactionAction, (transaction: Transaction) => Promise<unknown>>

export const useTransactionAction = (
  action: TransactionAction,
  workspaceId = getActiveWorkspaceUuid(),
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (transaction: Transaction) => {
      await transactionActions[action](transaction)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.all(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: transactionKeys.accounts(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: reportKeys.root(workspaceId) }),
      ])
    },
  })
}

export const useCreateAccount = (workspaceId = getActiveWorkspaceUuid()) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAccountInput) => transactionsApi.createAccount(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.accounts(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: reportKeys.root(workspaceId) }),
      ])
    },
  })
}

export const useUpdateAccount = (workspaceId = getActiveWorkspaceUuid()) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ account, input }: { account: Account; input: CreateAccountInput }) =>
      transactionsApi.updateAccount(account, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.accounts(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: reportKeys.root(workspaceId) }),
      ])
    },
  })
}

export const useRemoveAccount = (workspaceId = getActiveWorkspaceUuid()) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: transactionsApi.removeAccount,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.accounts(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: reportKeys.root(workspaceId) }),
      ])
    },
  })
}

export const useCreateCategory = (workspaceId = getActiveWorkspaceUuid()) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => transactionsApi.createCategory(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.categories(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: ['planning', workspaceId] }),
        queryClient.invalidateQueries({ queryKey: reportKeys.root(workspaceId) }),
      ])
    },
  })
}

export const useUpdateCategory = (workspaceId = getActiveWorkspaceUuid()) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ category, input }: { category: Category; input: CreateCategoryInput }) =>
      transactionsApi.updateCategory(category, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.categories(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: ['planning', workspaceId] }),
        queryClient.invalidateQueries({ queryKey: reportKeys.root(workspaceId) }),
      ])
    },
  })
}

export const useRemoveCategory = (workspaceId = getActiveWorkspaceUuid()) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: transactionsApi.removeCategory,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.categories(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: ['planning', workspaceId] }),
        queryClient.invalidateQueries({ queryKey: reportKeys.root(workspaceId) }),
      ])
    },
  })
}
