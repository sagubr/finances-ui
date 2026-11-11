import {
  civilDateSchema,
  pageInfoSchema,
  publicIdSchema,
  safeIntegerSchema,
} from '@/api/contract.schemas'
import { z } from 'zod'
import type {
  Asset,
  Instrument,
  InvestmentOrder,
  NetWorth,
  Page,
  Position,
  PositionPage,
} from './wealth.types'

const id = publicIdSchema
const money = safeIntegerSchema
const decimal = z.string().regex(/^-?\d+(\.\d+)?$/)
const date = civilDateSchema
const pageInfo = pageInfoSchema
const page = <T extends z.ZodType>(item: T) => z.object({ items: z.array(item), pageInfo })

export const instrumentSchema = z.object({
  id,
  symbol: z.string(),
  market: z.string(),
  name: z.string(),
  currency: z.string().length(3),
  type: z.enum(['STOCK', 'ETF', 'FUND', 'BOND', 'CRYPTO', 'CURRENCY', 'OTHER']),
  logoUrl: z.string().url().nullable(),
}) satisfies z.ZodType<Instrument>

export const orderSchema = z.object({
  id,
  accountId: id,
  instrumentId: id,
  side: z.enum(['BUY', 'SELL']),
  quantity: decimal,
  unitPrice: decimal,
  fees: decimal,
  currency: z.string().length(3),
  tradedOn: date,
  version: z.number().int().positive(),
}) satisfies z.ZodType<InvestmentOrder>

export const positionSchema = z.object({
  accountId: id,
  instrumentId: id,
  orderId: id.nullable(),
  orderVersion: z.number().int().positive().nullable(),
  orderQuantity: decimal.nullable(),
  orderUnitPrice: decimal.nullable(),
  orderFees: decimal.nullable(),
  orderTradedOn: date.nullable(),
  symbol: z.string(),
  name: z.string(),
  quantity: decimal,
  averageCost: decimal,
  totalCost: decimal,
  currency: z.string().length(3),
  logoUrl: z.string().url().nullable(),
  latestPrice: decimal.nullable(),
  currentValue: decimal.nullable(),
  unrealizedResult: decimal.nullable(),
  unrealizedPercent: decimal.nullable(),
  dayChange: decimal.nullable(),
  dayChangePercent: decimal.nullable(),
  quoteProvider: z.string().nullable(),
  quoteAt: z.string().datetime().nullable(),
  quoteIngestedAt: z.string().datetime().nullable(),
  quoteStale: z.boolean(),
}) satisfies z.ZodType<Position>

export const assetSchema = z.object({
  id,
  categoryId: id.nullable(),
  name: z.string(),
  status: z.enum(['PLANNED', 'ACTIVE', 'SOLD', 'ARCHIVED']),
  acquiredOn: date.nullable(),
  acquisitionCostCents: money,
  currency: z.string().length(3),
  valuationMethod: z.enum(['COST', 'LINEAR_DEPRECIATION', 'MARKET']),
  usefulLifeMonths: z.number().int().positive().nullable(),
  residualValueCents: money,
  version: z.number().int().positive(),
}) satisfies z.ZodType<Asset>

const netWorthComponentSchema = z.object({
  type: z.enum(['ACCOUNT', 'INVESTMENT', 'ASSET']),
  id,
  name: z.string(),
  valueCents: money,
  currency: z.string().length(3),
})
export const netWorthSchema = z.object({
  referenceOn: date,
  totals: z.array(z.object({ currency: z.string().length(3), amountCents: money })),
  components: z.array(netWorthComponentSchema),
  componentsTruncated: z.boolean(),
  calculatedAt: z.string().datetime(),
}) satisfies z.ZodType<NetWorth>

export const instrumentPageSchema = page(instrumentSchema) satisfies z.ZodType<Page<Instrument>>
export const positionPageSchema = page(positionSchema).extend({
  summaries: z.array(
    z.object({
      currency: z.string().length(3),
      invested: decimal,
      current: decimal,
      result: decimal,
      positionCount: z.number().int().nonnegative(),
      quotedPositions: z.number().int().nonnegative(),
    }),
  ),
}) satisfies z.ZodType<PositionPage>
export const assetPageSchema = page(assetSchema) satisfies z.ZodType<Page<Asset>>
