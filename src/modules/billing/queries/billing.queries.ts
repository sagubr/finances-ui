import { workspaceAccessStore } from '@/modules/workspaces/store/workspace-access.store'
import { queryOptions } from '@tanstack/react-query'
import { billingApi } from '../api/billing.api'
const root = () => ['billing', workspaceAccessStore.state.activeWorkspaceId] as const
export const plansQuery = () =>
  queryOptions({ queryKey: [...root(), 'plans'], queryFn: billingApi.plans })
export const subscriptionQuery = () =>
  queryOptions({ queryKey: [...root(), 'subscription'], queryFn: billingApi.subscription })
export const usageQuery = () =>
  queryOptions({ queryKey: [...root(), 'usage'], queryFn: billingApi.usage })
