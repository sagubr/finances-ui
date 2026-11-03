import apiClient from '@/api/client'
import {
  accountPageSchema,
  accountSchema,
  categoryPageSchema,
  categorySchema,
  monthlySummarySchema,
  transactionPageSchema,
  transactionSchema,
  transferSchema,
} from '../models/transaction.schemas'
import type {
  Account,
  Category,
  CreateAccountInput,
  CreateCategoryInput,
  CreateTransactionInput,
  CreateTransferInput,
  CursorPage,
  MonthlySummary,
  Transaction,
  TransactionFilters,
  Transfer,
  UpdateTransactionInput,
} from '../models/transaction.types'

const idempotencyHeaders = () => ({ 'idempotency-key': crypto.randomUUID() })

export const transactionsApi = {
  listAccounts: async (cursor?: string): Promise<CursorPage<Account>> => {
    const { data } = await apiClient.get<CursorPage<Account>>('/accounts', {
      params: { cursor, limit: 200 },
    })
    return accountPageSchema.parse(data)
  },
  listCategories: async (cursor?: string): Promise<CursorPage<Category>> => {
    const { data } = await apiClient.get<CursorPage<Category>>('/categories', {
      params: { cursor, limit: 200 },
    })
    return categoryPageSchema.parse(data)
  },
  createAccount: async (input: CreateAccountInput): Promise<Account> => {
    const { data } = await apiClient.post<Account>('/accounts', input, {
      headers: idempotencyHeaders(),
    })
    return accountSchema.parse(data)
  },
  updateAccount: async (account: Account, input: CreateAccountInput): Promise<Account> => {
    const { data } = await apiClient.patch<Account>(`/accounts/${account.id}`, {
      ...input,
      expectedVersion: account.version,
    })
    return accountSchema.parse(data)
  },
  removeAccount: async (account: Account): Promise<void> => {
    await apiClient.delete(`/accounts/${account.id}`, {
      data: { expectedVersion: account.version },
    })
  },
  createCategory: async (input: CreateCategoryInput): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/categories', input, {
      headers: idempotencyHeaders(),
    })
    return categorySchema.parse(data)
  },
  updateCategory: async (category: Category, input: CreateCategoryInput): Promise<Category> => {
    const { data } = await apiClient.patch<Category>(`/categories/${category.id}`, {
      ...input,
      expectedVersion: category.version,
    })
    return categorySchema.parse(data)
  },
  removeCategory: async (category: Category): Promise<void> => {
    await apiClient.delete(`/categories/${category.id}`, {
      data: { expectedVersion: category.version },
    })
  },
  list: async (filters: TransactionFilters, cursor?: string): Promise<CursorPage<Transaction>> => {
    const { data } = await apiClient.get<CursorPage<Transaction>>('/transactions', {
      params: { ...filters, cursor, limit: filters.limit ?? 50 },
    })
    return transactionPageSchema.parse(data)
  },
  create: async (input: CreateTransactionInput): Promise<Transaction> => {
    const { data } = await apiClient.post<Transaction>('/transactions', input, {
      headers: idempotencyHeaders(),
    })
    return transactionSchema.parse(data)
  },
  createTransfer: async (input: CreateTransferInput): Promise<Transfer> =>
    transferSchema.parse(
      (
        await apiClient.post('/transfers', input, {
          headers: idempotencyHeaders(),
        })
      ).data,
    ),
  update: async (id: string, input: UpdateTransactionInput): Promise<Transaction> => {
    const { data } = await apiClient.patch<Transaction>(`/transactions/${id}`, input)
    return transactionSchema.parse(data)
  },
  confirm: async (transaction: Pick<Transaction, 'id' | 'version'>): Promise<Transaction> => {
    const { data } = await apiClient.post<Transaction>(`/transactions/${transaction.id}/confirm`, {
      expectedVersion: transaction.version,
    })
    return transactionSchema.parse(data)
  },
  revertStatus: async (transaction: Pick<Transaction, 'id' | 'version'>): Promise<Transaction> => {
    const { data } = await apiClient.post<Transaction>(
      `/transactions/${transaction.id}/revert-status`,
      { expectedVersion: transaction.version },
    )
    return transactionSchema.parse(data)
  },
  settle: async (transaction: Pick<Transaction, 'id' | 'version'>): Promise<Transaction> => {
    const { data } = await apiClient.post<Transaction>(`/transactions/${transaction.id}/settle`, {
      expectedVersion: transaction.version,
    })
    return transactionSchema.parse(data)
  },
  remove: async (transaction: Pick<Transaction, 'id' | 'version'>): Promise<void> => {
    await apiClient.delete(`/transactions/${transaction.id}`, {
      data: { expectedVersion: transaction.version },
    })
  },
  monthlySummary: async (month: string): Promise<MonthlySummary> => {
    const { data } = await apiClient.get<MonthlySummary>('/reports/monthly-summary', {
      params: { month },
    })
    return monthlySummarySchema.parse(data)
  },
}
