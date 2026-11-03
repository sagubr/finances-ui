export type Page<T> = { items: T[]; pageInfo: { nextCursor: string | null; hasNextPage: boolean } }
export type InvestmentAccount = {
  id: string
  name: string
  currency: string
  active: boolean
  version: number
}
export type Instrument = {
  id: string
  symbol: string
  market: string
  name: string
  currency: string
  type: 'STOCK' | 'ETF' | 'FUND' | 'BOND' | 'CRYPTO' | 'CURRENCY' | 'OTHER'
}
export type InvestmentOrder = {
  id: string
  investmentAccountId: string
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
  investmentAccountId: string
  instrumentId: string
  symbol: string
  name: string
  quantity: string
  averageCost: string
  totalCost: string
  latestPrice: string | null
  quoteAt: string | null
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
