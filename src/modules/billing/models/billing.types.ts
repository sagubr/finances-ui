export type Plan = {
  id: string
  code: string
  name: string
  versionId: string
  version: number
  currency: string
  priceCents: number
  entitlements: unknown
}
export type Subscription = {
  id: string
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
  currentPeriodEnd: string | null
  code: string
  name: string
  entitlements: unknown
}
export type Usage = { items: { key: string; period: string; value: number; updatedAt: string }[] }
