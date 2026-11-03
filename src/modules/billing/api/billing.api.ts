import apiClient from '@/api/client'
import { planListSchema, subscriptionSchema, usageSchema } from '../models/billing.schemas'
import type { Plan, Subscription, Usage } from '../models/billing.types'
export const billingApi = {
  plans: async (): Promise<{ items: Plan[] }> =>
    planListSchema.parse((await apiClient.get('/billing/plans')).data),
  subscription: async (): Promise<Subscription | null> =>
    subscriptionSchema.nullable().parse((await apiClient.get('/billing/subscription')).data),
  usage: async (): Promise<Usage> =>
    usageSchema.parse((await apiClient.get('/billing/usage', { params: { limit: 100 } })).data),
}
