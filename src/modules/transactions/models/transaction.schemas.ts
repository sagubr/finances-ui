import {
  civilDateSchema,
  competenceMonthSchema,
  pageInfoSchema,
  publicIdSchema,
  safeIntegerSchema,
} from '@/api/contract.schemas'
import { z } from 'zod'
import type {
  Account,
  Category,
  CursorPage,
  MonthlySummary,
  Transaction,
  Transfer,
} from './transaction.types'

const currencySchema = z.string().length(3)
const idSchema = publicIdSchema
const monthSchema = competenceMonthSchema
const moneySchema = safeIntegerSchema

export const cursorPageSchema = <T extends z.ZodType>(item: T) =>
  z.object({ items: z.array(item), pageInfo: pageInfoSchema })

export const accountSchema = z.object({
  id: idSchema,
  name: z.string(),
  type: z.enum(['CHECKING', 'SAVINGS', 'CASH', 'BROKERAGE', 'BENEFIT', 'OTHER']),
  currency: currencySchema,
  openingBalanceCents: moneySchema,
  openingBalanceOn: civilDateSchema,
  currentBalanceCents: moneySchema,
  projectedBalanceCents: moneySchema,
  active: z.boolean(),
  version: z.number().int().positive(),
}) satisfies z.ZodType<Account>

export const categorySchema = z.object({
  id: idSchema,
  name: z.string(),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().nullable(),
  isDefault: z.boolean(),
  active: z.boolean(),
  version: z.number().int().positive(),
}) satisfies z.ZodType<Category>

export const transactionSchema = z.object({
  id: idSchema,
  accountId: idSchema,
  categoryId: idSchema.nullable(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER', 'CARD_PAYMENT', 'INVESTMENT']),
  status: z.enum(['PLANNED', 'CONFIRMED', 'SETTLED']),
  amountCents: moneySchema,
  currency: currencySchema,
  description: z.string(),
  occurredOn: civilDateSchema,
  competenceMonth: monthSchema,
  settledOn: civilDateSchema.nullable(),
  sourceModule: z.string().nullable(),
  sourcePublicId: idSchema.nullable(),
  version: z.number().int().positive(),
  deletedAt: z.string().datetime().nullable(),
}) satisfies z.ZodType<Transaction>
export const transferSchema = z.object({
  id: idSchema,
  debitTransactionId: idSchema,
  creditTransactionId: idSchema,
  amountCents: moneySchema,
  currency: currencySchema,
  version: z.number().int().positive(),
}) satisfies z.ZodType<Transfer>

export const monthlySummarySchema = z.object({
  month: monthSchema,
  incomeCents: moneySchema,
  expenseCents: moneySchema,
  plannedIncomeCents: moneySchema,
  plannedExpenseCents: moneySchema,
  plannedCardPaymentCents: moneySchema,
  netCents: moneySchema,
  plannedNetCents: moneySchema,
}) satisfies z.ZodType<MonthlySummary>

export const accountPageSchema = cursorPageSchema(accountSchema) satisfies z.ZodType<
  CursorPage<Account>
>
export const categoryPageSchema = cursorPageSchema(categorySchema) satisfies z.ZodType<
  CursorPage<Category>
>
export const transactionPageSchema = cursorPageSchema(transactionSchema) satisfies z.ZodType<
  CursorPage<Transaction>
>
