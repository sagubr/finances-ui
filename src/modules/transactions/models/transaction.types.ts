export type PageInfo = Readonly<{ nextCursor: string | null; hasNextPage: boolean }>
export type CursorPage<T> = Readonly<{ items: readonly T[]; pageInfo: PageInfo }>

export type Account = Readonly<{
  id: string
  name: string
  type: 'CHECKING' | 'SAVINGS' | 'CASH' | 'BROKERAGE' | 'BENEFIT' | 'OTHER'
  currency: string
  openingBalanceCents: number
  openingBalanceOn: string
  currentBalanceCents: number
  projectedBalanceCents: number
  active: boolean
  version: number
}>

export type Category = Readonly<{
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color: string | null
  isDefault: boolean
  active: boolean
  version: number
}>

export type CreateAccountInput = Readonly<{
  name: string
  type: Account['type']
  currency: string
  openingBalanceCents: number
  openingBalanceOn: string
}>

export type CreateCategoryInput = Readonly<{
  name: string
  type: Category['type']
  color?: string
}>

export type TransactionStatus = 'PLANNED' | 'CONFIRMED' | 'SETTLED'
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'CARD_PAYMENT' | 'INVESTMENT'
export type TransactionLocation = Readonly<{
  latitude: number
  longitude: number
  accuracyMeters: number | null
  capturedAt: string
  source: 'DEVICE' | 'MAP_PIN'
}>

export type Transaction = Readonly<{
  id: string
  accountId: string
  categoryId: string | null
  type: TransactionType
  status: TransactionStatus
  amountCents: number
  currency: string
  description: string
  occurredOn: string
  competenceMonth: string
  settledOn: string | null
  sourceModule: string | null
  sourcePublicId: string | null
  location: TransactionLocation | null
  version: number
  deletedAt: string | null
}>

export type TransactionFilters = Readonly<{
  month: string
  date?: string
  accountId?: string
  categoryId?: string
  type?: TransactionType
  status?: TransactionStatus
  search?: string
  limit?: number
}>

export type CreateTransactionInput = Readonly<{
  accountId: string
  categoryId?: string
  type: 'INCOME' | 'EXPENSE'
  status: TransactionStatus
  amountCents: number
  currency: string
  description: string
  occurredOn: string
  location?: TransactionLocation
}>
export type CreateTransferInput = Readonly<{
  fromAccountId: string
  toAccountId: string
  amountCents: number
  currency: string
  description: string
  occurredOn: string
  status: TransactionStatus
}>
export type Transfer = Readonly<{
  id: string
  debitTransactionId: string
  creditTransactionId: string
  amountCents: number
  currency: string
  version: number
}>

export type UpdateTransactionInput = Readonly<{
  expectedVersion: number
  accountId: string
  categoryId: string | null
  amountCents: number
  description: string
  occurredOn: string
  location?: TransactionLocation | null
}>

export type MonthlySummary = Readonly<{
  month: string
  incomeCents: number
  expenseCents: number
  plannedIncomeCents: number
  plannedExpenseCents: number
  plannedCardPaymentCents: number
  netCents: number
  plannedNetCents: number
}>

export type TransactionMapFeatureProperties = Readonly<{
  transactionId: string
  accountId: string
  accountName: string
  categoryId: string | null
  categoryName: string | null
  categoryColor: string | null
  description: string
  amountCents: number
  currency: string
  occurredOn: string
  status: TransactionStatus
  sourceModule: string | null
}>

export type TransactionMap = Readonly<{
  type: 'FeatureCollection'
  features: ReadonlyArray<{
    type: 'Feature'
    id: string
    geometry: { type: 'Point'; coordinates: [number, number] }
    properties: TransactionMapFeatureProperties
  }>
  summary: Readonly<{
    transactionCount: number
    locatedCount: number
    unlocatedCount: number
    locatedAmountCents: number
  }>
}>
