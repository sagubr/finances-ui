export type Page<T> = { items: T[]; pageInfo: { nextCursor: string | null; hasNextPage: boolean } }
export type PositionPage = Page<Position> & {
  summaries: {
    currency: string
    invested: string
    current: string
    result: string
    positionCount: number
    quotedPositions: number
  }[]
}
export type Instrument = {
  id: string
  symbol: string
  market: string
  name: string
  currency: string
  logoUrl: string | null
  type: 'STOCK' | 'ETF' | 'FUND' | 'BOND' | 'CRYPTO' | 'CURRENCY' | 'OTHER'
}
export type InvestmentOrder = {
  id: string
  accountId: string
  instrumentId: string
  side: 'BUY' | 'SELL'
  quantity: string
  unitPrice: string
  fees: string
  currency: string
  tradedOn: string
  version: number
}
export type Position = {
  accountId: string
  instrumentId: string
  symbol: string
  name: string
  quantity: string
  averageCost: string
  totalCost: string
  currency: string
  orderId: string | null
  orderVersion: number | null
  orderQuantity: string | null
  orderUnitPrice: string | null
  orderFees: string | null
  orderTradedOn: string | null
  logoUrl: string | null
  latestPrice: string | null
  currentValue: string | null
  unrealizedResult: string | null
  unrealizedPercent: string | null
  dayChange: string | null
  dayChangePercent: string | null
  quoteProvider: string | null
  quoteAt: string | null
  quoteIngestedAt: string | null
  quoteStale: boolean
}
export type Asset = {
  id: string
  categoryId: string | null
  name: string
  status: 'PLANNED' | 'ACTIVE' | 'SOLD' | 'ARCHIVED'
  acquiredOn: string | null
  acquisitionCostCents: number
  currency: string
  valuationMethod: 'COST' | 'LINEAR_DEPRECIATION' | 'MARKET'
  usefulLifeMonths: number | null
  residualValueCents: number
  version: number
}
export type NetWorth = {
  referenceOn: string
  totals: { currency: string; amountCents: number }[]
  components: {
    type: 'ACCOUNT' | 'INVESTMENT' | 'ASSET'
    id: string
    name: string
    valueCents: number
    currency: string
  }[]
  componentsTruncated: boolean
  calculatedAt: string
}
