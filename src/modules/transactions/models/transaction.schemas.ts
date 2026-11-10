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
  TransactionLocation,
  TransactionMap,
  Transfer,
} from './transaction.types'

const currencySchema = z.string().length(3)
const idSchema = publicIdSchema
const monthSchema = competenceMonthSchema
const moneySchema = safeIntegerSchema

export const transactionLocationSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  accuracyMeters: z.number().finite().positive().nullable(),
  capturedAt: z.string().datetime({ offset: true }),
  source: z.enum(['DEVICE', 'MAP_PIN']),
}) satisfies z.ZodType<TransactionLocation>

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
  sourcePublicId: z.string().uuid().nullable(),
  location: transactionLocationSchema.nullable().default(null),
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
export const transactionMapSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(
    z.object({
      type: z.literal('Feature'),
      id: idSchema,
      geometry: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()]),
      }),
      properties: z.object({
        transactionId: idSchema,
        accountId: idSchema,
        accountName: z.string(),
        categoryId: idSchema.nullable(),
        categoryName: z.string().nullable(),
        categoryColor: z.string().nullable(),
        description: z.string(),
        amountCents: moneySchema.positive(),
        currency: currencySchema,
        occurredOn: civilDateSchema,
        status: z.enum(['PLANNED', 'CONFIRMED', 'SETTLED']),
        sourceModule: z.string().nullable(),
      }),
    }),
  ),
  summary: z.object({
    transactionCount: z.number().int().nonnegative(),
    locatedCount: z.number().int().nonnegative(),
    unlocatedCount: z.number().int().nonnegative(),
    locatedAmountCents: moneySchema.nonnegative(),
  }),
}) satisfies z.ZodType<TransactionMap>
