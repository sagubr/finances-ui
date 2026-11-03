import {
  civilDateSchema,
  competenceMonthSchema,
  publicIdSchema,
  safeIntegerSchema,
} from '@/api/contract.schemas'
import { z } from 'zod'
import type {
  AnnualReport,
  CashflowForecast,
  CategorySpending,
  ComparisonReport,
  ExportAccepted,
  ExportJob,
} from './report.types'
const annualMonth = z.object({
  month: competenceMonthSchema,
  incomeCents: safeIntegerSchema,
  expenseCents: safeIntegerSchema,
  netCents: safeIntegerSchema,
  plannedIncomeCents: safeIntegerSchema,
  plannedExpenseCents: safeIntegerSchema,
  plannedNetCents: safeIntegerSchema,
})
export const annualReportSchema = z.object({
  year: z.number().int(),
  months: z.array(annualMonth),
  totals: z.object({
    incomeCents: safeIntegerSchema,
    expenseCents: safeIntegerSchema,
    netCents: safeIntegerSchema,
  }),
  calculatedAt: z.string().datetime(),
  dataVersion: z.number().int(),
}) satisfies z.ZodType<AnnualReport>
const comparisonPeriod = z.object({
  month: competenceMonthSchema,
  incomeCents: safeIntegerSchema,
  expenseCents: safeIntegerSchema,
})
const variation = z.object({ bps: z.number().int().nullable() })
export const comparisonReportSchema = z.object({
  current: comparisonPeriod,
  previous: comparisonPeriod,
  variation: z.object({ income: variation, expense: variation }),
  calculatedAt: z.string().datetime(),
}) satisfies z.ZodType<ComparisonReport>
export const cashflowForecastSchema = z.object({
  from: civilDateSchema,
  to: civilDateSchema,
  items: z.array(
    z.object({
      date: civilDateSchema,
      plannedIncomeCents: safeIntegerSchema,
      plannedExpenseCents: safeIntegerSchema,
      plannedInvestmentCents: safeIntegerSchema,
      plannedNetCents: safeIntegerSchema,
    }),
  ),
  totals: z.object({
    plannedIncomeCents: safeIntegerSchema,
    plannedExpenseCents: safeIntegerSchema,
    plannedInvestmentCents: safeIntegerSchema,
    plannedNetCents: safeIntegerSchema,
  }),
  calculatedAt: z.string().datetime(),
}) satisfies z.ZodType<CashflowForecast>
export const categorySpendingSchema = z.object({
  month: competenceMonthSchema,
  items: z.array(
    z.object({
      categoryId: publicIdSchema,
      categoryName: z.string(),
      color: z.string().nullable(),
      realizedCents: safeIntegerSchema,
      plannedCents: safeIntegerSchema,
      totalCents: safeIntegerSchema,
    }),
  ),
  totals: z.object({
    realizedCents: safeIntegerSchema,
    plannedCents: safeIntegerSchema,
    totalCents: safeIntegerSchema,
  }),
  calculatedAt: z.string().datetime(),
}) satisfies z.ZodType<CategorySpending>
export const exportAcceptedSchema = z.object({
  id: publicIdSchema,
  status: z.literal('PENDING'),
}) satisfies z.ZodType<ExportAccepted>
export const exportJobSchema = z.object({
  id: publicIdSchema,
  report: z.enum(['TRANSACTIONS', 'ANNUAL']),
  format: z.enum(['CSV', 'JSON']),
  status: z.enum(['PENDING', 'RUNNING', 'READY', 'FAILED', 'EXPIRED', 'CANCELLED']),
  progress: z.number(),
  errorCode: z.string().nullable(),
}) satisfies z.ZodType<ExportJob>
