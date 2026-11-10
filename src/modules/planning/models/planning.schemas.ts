import {
  civilDateSchema,
  competenceMonthSchema,
  pageInfoSchema,
  publicIdSchema,
  safeIntegerSchema,
} from '@/api/contract.schemas'
import { transactionLocationSchema } from '@/modules/transactions/models/transaction.schemas'
import { z } from 'zod'
import type {
  Budget,
  BudgetCopy,
  BudgetProgress,
  CardPurchase,
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
  StatementPurchase,
  StatementReopen,
} from './planning.types'

const id = publicIdSchema
const date = civilDateSchema
const month = competenceMonthSchema
const money = safeIntegerSchema
const pageInfo = pageInfoSchema
const page = <T extends z.ZodType>(item: T) => z.object({ items: z.array(item), pageInfo })

export const budgetSchema = z.object({
  id,
  month,
  categoryId: id,
  categoryName: z.string(),
  limitCents: money.nonnegative(),
  currency: z.string().length(3),
  version: z.number().int().positive(),
}) satisfies z.ZodType<Budget>

export const budgetProgressSchema = z.object({
  id,
  limitCents: money.nonnegative(),
  realizedCents: money.nonnegative(),
  plannedCents: money.nonnegative(),
  consumptionBps: z.number().int().nullable(),
  currency: z.string().length(3),
}) satisfies z.ZodType<BudgetProgress>

export const budgetCopySchema = z.object({
  sourceMonth: month,
  targetMonth: month,
  copied: z.number().int().nonnegative(),
}) satisfies z.ZodType<BudgetCopy>

export const recurringRuleSchema = z.object({
  id,
  accountId: id,
  creditCardId: id.nullable(),
  creditCardName: z.string().nullable(),
  categoryId: id.nullable(),
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string(),
  amountCents: money.positive(),
  currency: z.string().length(3),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  interval: z.number().int().positive(),
  dayOfMonth: z.number().int().nullable(),
  dayOfWeek: z.number().int().nullable(),
  startsOn: date,
  endsOn: date.nullable(),
  nextOccurrenceOn: date,
  timezone: z.string(),
  pausedAt: z.string().datetime().nullable(),
  version: z.number().int().positive(),
}) satisfies z.ZodType<RecurringRule>

export const creditCardSchema = z.object({
  id,
  name: z.string(),
  lastFour: z.string().nullable(),
  paymentAccountId: id.nullable(),
  currency: z.string().length(3),
  limitCents: money.positive(),
  closingDay: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
  accountingMode: z.enum(['DETAILED', 'PAYMENT_ONLY']),
  active: z.boolean(),
  version: z.number().int().positive(),
}) satisfies z.ZodType<CreditCard>

export const statementSchema = z.object({
  id,
  cycleStartOn: date,
  cycleEndOn: date,
  dueOn: date,
  status: z.enum(['OPEN', 'CLOSED', 'PARTIALLY_PAID', 'PAID']),
  totalCents: money.nonnegative(),
  paidCents: money.nonnegative(),
  version: z.number().int().positive(),
}) satisfies z.ZodType<Statement>

export const statementPurchaseSchema = z.object({
  id,
  categoryId: id,
  description: z.string(),
  amountCents: money.positive(),
  currency: z.string().length(3),
  occurredOn: date,
  location: transactionLocationSchema.nullable().default(null),
  editable: z.boolean(),
  version: z.number().int().positive(),
}) satisfies z.ZodType<StatementPurchase>

export const cardPurchaseSchema = z.object({
  id,
  cardId: id,
  statementId: id,
  categoryId: id,
  amountCents: money.positive(),
  description: z.string(),
  occurredOn: date,
  competenceMonth: month,
  currency: z.string().length(3),
  status: z.literal('CONFIRMED'),
  location: transactionLocationSchema.nullable().default(null),
  version: z.number().int().positive(),
}) satisfies z.ZodType<CardPurchase>

export const statementCloseSchema = z.object({
  id,
  status: z.literal('CLOSED'),
  totalCents: money.nonnegative(),
  version: z.number().int().positive(),
}) satisfies z.ZodType<StatementClose>

export const statementReopenSchema = z.object({
  id,
  status: z.literal('OPEN'),
  totalCents: money.nonnegative(),
  version: z.number().int().positive(),
}) satisfies z.ZodType<StatementReopen>

export const statementPaymentSchema = z.object({
  id,
  statementId: id,
  transactionId: id,
  amountCents: money.positive(),
  paidCents: money.positive(),
  status: z.enum(['PARTIALLY_PAID', 'PAID']),
  version: z.number().int().positive(),
}) satisfies z.ZodType<StatementPayment>

export const statementDetailSchema = statementSchema.extend({
  cardId: id,
  accountingMode: z.enum(['DETAILED', 'PAYMENT_ONLY']),
  purchases: page(statementPurchaseSchema),
}) satisfies z.ZodType<StatementDetail>

export const installmentPlanSchema = z.object({
  id,
  accountId: id,
  creditCardId: id.nullable(),
  creditCardName: z.string().nullable(),
  categoryId: id.nullable(),
  description: z.string(),
  totalAmountCents: money.positive(),
  installments: z.number().int().positive(),
  firstDueOn: date,
  currency: z.string().length(3),
  version: z.number().int().positive(),
}) satisfies z.ZodType<InstallmentPlan>

export const importBatchSchema = z.object({
  id,
  status: z.enum(['UPLOADED', 'PROCESSING', 'PREVIEWED', 'COMMITTED', 'ROLLED_BACK', 'FAILED']),
  fileName: z.string(),
  rowCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  committedAt: z.string().datetime().nullable(),
  rolledBackAt: z.string().datetime().nullable(),
}) satisfies z.ZodType<ImportBatch>

export const importPreviewSchema = z.object({
  id,
  status: z.literal('PREVIEWED'),
  rowCount: z.number().int().nonnegative(),
  valid: z.number().int().nonnegative(),
  invalid: z.number().int().nonnegative(),
}) satisfies z.ZodType<ImportPreview>

export const importRowSchema = z.object({
  id,
  rowNumber: z.number().int().positive(),
  status: z.enum(['VALID', 'WARNING', 'ERROR', 'COMMITTED', 'SKIPPED']),
  normalized: z.record(z.string(), z.union([z.string(), z.number()])).nullable(),
  errors: z.array(z.string()),
}) satisfies z.ZodType<ImportRow>

export const budgetPageSchema = page(budgetSchema) satisfies z.ZodType<Page<Budget>>
export const recurringPageSchema = page(recurringRuleSchema) satisfies z.ZodType<
  Page<RecurringRule>
>
export const cardPageSchema = page(creditCardSchema) satisfies z.ZodType<Page<CreditCard>>
export const statementPageSchema = page(statementSchema) satisfies z.ZodType<Page<Statement>>
export const installmentPlanPageSchema = page(installmentPlanSchema) satisfies z.ZodType<
  Page<InstallmentPlan>
>
export const importRowPageSchema = page(importRowSchema) satisfies z.ZodType<Page<ImportRow>>
export const budgetProgressResponseSchema = z.object({
  month,
  items: z.array(budgetProgressSchema),
})
export const installmentCreatedSchema = z.object({ id })
