import apiClient from '@/api/client'
import {
  budgetCopySchema,
  budgetPageSchema,
  budgetProgressResponseSchema,
  budgetSchema,
  cardPageSchema,
  cardPurchaseSchema,
  creditCardSchema,
  importBatchSchema,
  importPreviewSchema,
  importRowPageSchema,
  installmentCreatedSchema,
  installmentPlanPageSchema,
  installmentPlanSchema,
  recurringPageSchema,
  recurringRuleSchema,
  statementCloseSchema,
  statementDetailSchema,
  statementPageSchema,
  statementPaymentSchema,
  statementReopenSchema,
} from '../models/planning.schemas'
import type {
  Budget,
  BudgetCopy,
  BudgetProgress,
  CardPurchase,
  CardPurchaseInput,
  CreateBudgetInput,
  CreateInstallmentInput,
  CreditCard,
  ImportBatch,
  ImportPreview,
  ImportRow,
  InstallmentPlan,
  Page,
  RecurringRule,
  Statement,
  StatementClose,
  StatementDetail,
  StatementPayment,
  StatementPaymentInput,
  StatementPurchase,
  StatementReopen,
} from '../models/planning.types'

const idempotency = () => ({ 'idempotency-key': crypto.randomUUID() })

export const planningApi = {
  budgets: async (month: string): Promise<Page<Budget>> =>
    budgetPageSchema.parse(
      (await apiClient.get<Page<Budget>>('/budgets', { params: { month, limit: 200 } })).data,
    ),
  budgetProgress: async (month: string): Promise<{ month: string; items: BudgetProgress[] }> =>
    budgetProgressResponseSchema.parse(
      (await apiClient.get('/budgets/progress', { params: { month, limit: 200 } })).data,
    ),
  createBudget: async (input: CreateBudgetInput): Promise<Budget> =>
    budgetSchema.parse((await apiClient.post('/budgets', input, { headers: idempotency() })).data),
  copyBudgets: async (sourceMonth: string, targetMonth: string): Promise<BudgetCopy> =>
    budgetCopySchema.parse(
      (
        await apiClient.post(
          '/budgets/copy',
          { sourceMonth, targetMonth },
          { headers: idempotency() },
        )
      ).data,
    ),
  recurring: async (): Promise<Page<RecurringRule>> =>
    recurringPageSchema.parse(
      (await apiClient.get('/recurring-rules', { params: { limit: 200 } })).data,
    ),
  updateBudget: async (budget: Budget, limitCents: number): Promise<Budget> =>
    budgetSchema.parse(
      (
        await apiClient.patch(`/budgets/${budget.id}`, {
          expectedVersion: budget.version,
          limitCents,
        })
      ).data,
    ),
  removeBudget: async (budget: Budget): Promise<void> => {
    await apiClient.delete(`/budgets/${budget.id}`, {
      data: { expectedVersion: budget.version },
    })
  },
  createRecurring: async (input: {
    accountId: string
    creditCardId?: string
    categoryId?: string
    type: 'INCOME' | 'EXPENSE'
    description: string
    amountCents: number
    currency: string
    frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
    interval: number
    dayOfMonth?: number
    dayOfWeek?: number
    startsOn: string
    endsOn?: string
    timezone: string
  }): Promise<RecurringRule> =>
    recurringRuleSchema.parse(
      (await apiClient.post('/recurring-rules', input, { headers: idempotency() })).data,
    ),
  updateRecurring: async (
    rule: RecurringRule,
    input: {
      description: string
      amountCents: number
      frequency: RecurringRule['frequency']
      interval: number
      dayOfMonth: number | null
      dayOfWeek: number | null
      endsOn: string | null
      timezone: string
    },
  ): Promise<RecurringRule> =>
    recurringRuleSchema.parse(
      (
        await apiClient.patch(`/recurring-rules/${rule.id}`, {
          ...input,
          expectedVersion: rule.version,
        })
      ).data,
    ),
  removeRecurring: async (rule: RecurringRule): Promise<void> => {
    await apiClient.delete(`/recurring-rules/${rule.id}`, {
      data: { expectedVersion: rule.version, deletePlannedOccurrences: true },
    })
  },
  createInstallments: async (input: CreateInstallmentInput): Promise<{ id: string }> =>
    installmentCreatedSchema.parse(
      (await apiClient.post('/installment-plans', input, { headers: idempotency() })).data,
    ),
  updateInstallments: async (
    plan: InstallmentPlan,
    input: Omit<CreateInstallmentInput, 'installments'>,
  ): Promise<InstallmentPlan> =>
    installmentPlanSchema.parse(
      (
        await apiClient.patch(`/installment-plans/${plan.id}`, {
          ...input,
          expectedVersion: plan.version,
        })
      ).data,
    ),
  removeInstallments: async (plan: InstallmentPlan): Promise<void> => {
    await apiClient.delete(`/installment-plans/${plan.id}`, {
      data: { expectedVersion: plan.version },
    })
  },
  installments: async (): Promise<Page<InstallmentPlan>> =>
    installmentPlanPageSchema.parse(
      (await apiClient.get('/installment-plans', { params: { limit: 200 } })).data,
    ),
  toggleRecurring: async (rule: RecurringRule): Promise<void> => {
    const action = rule.pausedAt ? 'resume' : 'pause'
    await apiClient.post(`/recurring-rules/${rule.id}/${action}`, { expectedVersion: rule.version })
  },
  cards: async (): Promise<Page<CreditCard>> =>
    cardPageSchema.parse((await apiClient.get('/credit-cards', { params: { limit: 200 } })).data),
  createCard: async (input: {
    name: string
    paymentAccountId: string
    currency: string
    limitCents: number
    closingDay: number
    dueDay: number
    accountingMode: CreditCard['accountingMode']
  }): Promise<CreditCard> =>
    creditCardSchema.parse(
      (await apiClient.post('/credit-cards', input, { headers: idempotency() })).data,
    ),
  updateCard: async (
    card: CreditCard,
    input: {
      name: string
      paymentAccountId: string
      currency: string
      limitCents: number
      closingDay: number
      dueDay: number
      accountingMode: CreditCard['accountingMode']
    },
  ): Promise<CreditCard> =>
    creditCardSchema.parse(
      (
        await apiClient.patch(`/credit-cards/${card.id}`, {
          ...input,
          lastFour: card.lastFour ?? undefined,
          expectedVersion: card.version,
        })
      ).data,
    ),
  removeCard: async (card: CreditCard): Promise<void> => {
    await apiClient.delete(`/credit-cards/${card.id}`, {
      data: { expectedVersion: card.version },
    })
  },
  statements: async (cardId: string): Promise<Page<Statement>> =>
    statementPageSchema.parse(
      (await apiClient.get(`/credit-cards/${cardId}/statements`, { params: { limit: 200 } })).data,
    ),
  statement: async (statementId: string): Promise<StatementDetail> =>
    statementDetailSchema.parse(
      (await apiClient.get(`/statements/${statementId}`, { params: { limit: 200 } })).data,
    ),
  createCardPurchase: async (card: CreditCard, input: CardPurchaseInput): Promise<CardPurchase> =>
    cardPurchaseSchema.parse(
      (
        await apiClient.post(`/credit-cards/${card.id}/purchases`, input, {
          headers: idempotency(),
        })
      ).data,
    ),
  updateCardPurchase: async (
    cardId: string,
    purchase: StatementPurchase,
    input: CardPurchaseInput,
  ): Promise<CardPurchase> =>
    cardPurchaseSchema.parse(
      (
        await apiClient.patch(`/credit-cards/${cardId}/purchases/${purchase.id}`, {
          ...input,
          expectedVersion: purchase.version,
        })
      ).data,
    ),
  deleteCardPurchase: async (cardId: string, purchase: StatementPurchase): Promise<void> => {
    await apiClient.delete(`/credit-cards/${cardId}/purchases/${purchase.id}`, {
      data: { expectedVersion: purchase.version },
    })
  },
  closeStatement: async (statement: Statement): Promise<StatementClose> =>
    statementCloseSchema.parse(
      (
        await apiClient.post(`/statements/${statement.id}/close`, {
          expectedVersion: statement.version,
        })
      ).data,
    ),
  reopenStatement: async (statement: Statement): Promise<StatementReopen> =>
    statementReopenSchema.parse(
      (
        await apiClient.post(`/statements/${statement.id}/reopen`, {
          expectedVersion: statement.version,
        })
      ).data,
    ),
  payStatement: async (
    statement: Statement,
    input: StatementPaymentInput,
  ): Promise<StatementPayment> =>
    statementPaymentSchema.parse(
      (
        await apiClient.post(
          `/statements/${statement.id}/pay`,
          { ...input, expectedVersion: statement.version },
          { headers: idempotency() },
        )
      ).data,
    ),
  uploadImport: async (file: File): Promise<ImportPreview> => {
    const body = new FormData()
    body.append('file', file)
    return importPreviewSchema.parse(
      (await apiClient.post('/imports', body, { headers: idempotency() })).data,
    )
  },
  importBatch: async (id: string): Promise<ImportBatch> =>
    importBatchSchema.parse((await apiClient.get(`/imports/${id}`)).data),
  importRows: async (id: string): Promise<Page<ImportRow>> =>
    importRowPageSchema.parse(
      (await apiClient.get(`/imports/${id}/rows`, { params: { limit: 200 } })).data,
    ),
  commitImport: async (id: string): Promise<void> => {
    await apiClient.post(`/imports/${id}/commit`, {}, { headers: idempotency() })
  },
  rollbackImport: async (id: string): Promise<void> => {
    await apiClient.post(`/imports/${id}/rollback`, {})
  },
}
