import apiClient from '@/api/client'
import {
  assetPageSchema,
  assetSchema,
  instrumentPageSchema,
  instrumentSchema,
  netWorthSchema,
  orderSchema,
  positionPageSchema,
} from '../models/wealth.schemas'
import type {
  Asset,
  Instrument,
  InvestmentOrder,
  NetWorth,
  Page,
  PositionPage,
} from '../models/wealth.types'

const idempotency = () => ({ 'idempotency-key': crypto.randomUUID() })
export const wealthApi = {
  instruments: async (q = ''): Promise<Page<Instrument>> =>
    instrumentPageSchema.parse(
      (await apiClient.get('/instruments', { params: { q: q || undefined, limit: 100 } })).data,
    ),
  resolveInstrument: async (ticker: string): Promise<Instrument> =>
    instrumentSchema.parse((await apiClient.post('/instruments/resolve', { ticker })).data),
  positions: async (): Promise<PositionPage> =>
    positionPageSchema.parse(
      (await apiClient.get('/investments/positions', { params: { limit: 200 } })).data,
    ),
  assets: async (): Promise<Page<Asset>> =>
    assetPageSchema.parse((await apiClient.get('/assets', { params: { limit: 200 } })).data),
  netWorth: async (date?: string): Promise<NetWorth> =>
    netWorthSchema.parse((await apiClient.get('/net-worth', { params: { date } })).data),
  createOrder: async (input: {
    accountId: string
    instrumentId: string
    side: 'BUY' | 'SELL'
    quantity: string
    unitPrice: string
    fees: string
    currency: string
    tradedOn: string
  }): Promise<InvestmentOrder> =>
    orderSchema.parse(
      (await apiClient.post('/investments/orders', input, { headers: idempotency() })).data,
    ),
  updateOrder: async (
    orderId: string,
    input: {
      expectedVersion: number
      quantity: string
      unitPrice: string
      fees: string
      tradedOn: string
    },
  ): Promise<void> => {
    await apiClient.patch(`/investments/orders/${orderId}`, input)
  },
  removeOrder: async (orderId: string, expectedVersion: number): Promise<void> => {
    await apiClient.delete(`/investments/orders/${orderId}`, { data: { expectedVersion } })
  },
  createAsset: async (input: {
    name: string
    status: 'PLANNED' | 'ACTIVE'
    acquisitionCostCents: number
    currency: string
    valuationMethod: Asset['valuationMethod']
    residualValueCents: number
  }): Promise<Asset> =>
    assetSchema.parse((await apiClient.post('/assets', input, { headers: idempotency() })).data),
  updateAsset: async (
    asset: Asset,
    input: {
      name: string
      status: Exclude<Asset['status'], 'ARCHIVED'>
      acquisitionCostCents: number
      currency: string
      valuationMethod: Asset['valuationMethod']
      residualValueCents: number
    },
  ): Promise<Asset> =>
    assetSchema.parse(
      (
        await apiClient.patch(`/assets/${asset.id}`, {
          ...input,
          categoryId: asset.categoryId ?? undefined,
          acquiredOn: asset.acquiredOn ?? undefined,
          usefulLifeMonths: asset.usefulLifeMonths ?? undefined,
          expectedVersion: asset.version,
        })
      ).data,
    ),
  removeAsset: async (asset: Asset): Promise<void> => {
    await apiClient.delete(`/assets/${asset.id}`, {
      data: { expectedVersion: asset.version },
    })
  },
}
