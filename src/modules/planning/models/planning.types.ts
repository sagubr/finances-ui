export type Page<T> = { items: T[]; pageInfo: { nextCursor: string | null; hasNextPage: boolean } }

export type Budget = {
  id: string
  month: string
  categoryId: string
  categoryName: string
  limitCents: number
  currency: string
  version: number
}

export type CreateBudgetInput = {
  month: string
  categoryId: string
  limitCents: number
  currency: string
}

export type BudgetProgress = {
  id: string
  limitCents: number
  realizedCents: number
  plannedCents: number
  consumptionBps: number | null
  currency: string
}

export type BudgetCopy = {
  sourceMonth: string
  targetMonth: string
  copied: number
}

export type RecurringRule = {
  id: string
  accountId: string
  creditCardId: string | null
  creditCardName: string | null
  categoryId: string | null
  type: 'INCOME' | 'EXPENSE'
  description: string
  amountCents: number
  currency: string
  frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  interval: number
  dayOfMonth: number | null
  dayOfWeek: number | null
  startsOn: string
  endsOn: string | null
  nextOccurrenceOn: string
  timezone: string
  pausedAt: string | null
  version: number
}

export type CreditCard = {
  id: string
  name: string
  lastFour: string | null
  paymentAccountId: string | null
  currency: string
  limitCents: number
  closingDay: number
  dueDay: number
  accountingMode: 'DETAILED' | 'PAYMENT_ONLY'
  active: boolean
  version: number
}

export type Statement = {
  id: string
  cycleStartOn: string
  cycleEndOn: string
  dueOn: string
  status: 'OPEN' | 'CLOSED' | 'PARTIALLY_PAID' | 'PAID'
  totalCents: number
  paidCents: number
  version: number
}

export type StatementPurchase = {
  id: string
  categoryId: string
  description: string
  amountCents: number
  currency: string
  occurredOn: string
  editable: boolean
  version: number
}

export type StatementDetail = Statement & {
  cardId: string
  accountingMode: CreditCard['accountingMode']
  purchases: Page<StatementPurchase>
}

export type CardPurchaseInput = {
  categoryId: string
  amountCents: number
  description: string
  occurredOn: string
}

export type CardPurchase = CardPurchaseInput & {
  id: string
  cardId: string
  statementId: string
  currency: string
  competenceMonth: string
  status: 'CONFIRMED'
  version: number
}

export type StatementClose = {
  id: string
  status: 'CLOSED'
  totalCents: number
  version: number
}

export type StatementPayment = {
  id: string
  statementId: string
  transactionId: string
  amountCents: number
  paidCents: number
  status: 'PARTIALLY_PAID' | 'PAID'
  version: number
}

export type StatementPaymentInput = {
  accountId: string
  amountCents: number
  paidOn: string
}

export type InstallmentPlan = {
  id: string
  accountId: string
  creditCardId: string | null
  creditCardName: string | null
  categoryId: string | null
  description: string
  totalAmountCents: number
  installments: number
  firstDueOn: string
  currency: string
  version: number
}

export type CreateInstallmentInput = {
  accountId: string
  creditCardId?: string
  categoryId?: string
  description: string
  totalAmountCents: number
  installments: number
  firstDueOn: string
  currency: string
}

export type ImportBatch = {
  id: string
  status: 'UPLOADED' | 'PROCESSING' | 'PREVIEWED' | 'COMMITTED' | 'ROLLED_BACK' | 'FAILED'
  fileName: string
  rowCount: number
  createdAt: string
  committedAt: string | null
  rolledBackAt: string | null
}

export type ImportPreview = {
  id: string
  status: 'PREVIEWED'
  rowCount: number
  valid: number
  invalid: number
}

export type ImportRow = {
  id: string
  rowNumber: number
  status: 'VALID' | 'WARNING' | 'ERROR' | 'COMMITTED' | 'SKIPPED'
  normalized: Record<string, string | number | undefined> | null
  errors: string[]
}
