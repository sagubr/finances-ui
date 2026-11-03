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
  InvestmentAccount,
  InvestmentOrder,
  NetWorth,
  Page,
  Position,
} from './wealth.types'

const id = publicIdSchema
const money = safeIntegerSchema
const decimal = z.string().regex(/^-?\d+(\.\d+)?$/)
const date = civilDateSchema
const pageInfo = pageInfoSchema
const page = <T extends z.ZodType>(item: T) => z.object({ items: z.array(item), pageInfo })

export const investmentAccountSchema = z.object({
  id,
  name: z.string(),
  currency: z.string().length(3),
  active: z.boolean(),
  version: z.number().int().positive(),
}) satisfies z.ZodType<InvestmentAccount>

export const instrumentSchema = z.object({
  id,
  symbol: z.string(),
  market: z.string(),
  name: z.string(),
  currency: z.string().length(3),
  type: z.enum(['STOCK', 'ETF', 'FUND', 'BOND', 'CRYPTO', 'CURRENCY', 'OTHER']),
}) satisfies z.ZodType<Instrument>

export const orderSchema = z.object({
  id,
  investmentAccountId: id,
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
  investmentAccountId: id,
  instrumentId: id,
  symbol: z.string(),
  name: z.string(),
  quantity: decimal,
  averageCost: decimal,
  totalCost: decimal,
  latestPrice: decimal.nullable(),
  quoteAt: z.string().datetime().nullable(),
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

export const investmentAccountPageSchema = page(investmentAccountSchema) satisfies z.ZodType<
  Page<InvestmentAccount>
>
export const instrumentPageSchema = page(instrumentSchema) satisfies z.ZodType<Page<Instrument>>
export const positionPageSchema = page(positionSchema) satisfies z.ZodType<Page<Position>>
export const assetPageSchema = page(assetSchema) satisfies z.ZodType<Page<Asset>>
