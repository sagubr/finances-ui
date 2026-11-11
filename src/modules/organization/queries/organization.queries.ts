import { workspaceAccessStore } from '@/modules/workspaces/store/workspace-access.store'
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationApi } from '../api/organization.api'
import type { WishlistFilters } from '../models/organization.types'
const root = () => ['organization', workspaceAccessStore.state.activeWorkspaceId] as const
export const activitiesQuery = () =>
  queryOptions({ queryKey: [...root(), 'activities'], queryFn: organizationApi.activities })
export const goalsQuery = () =>
  queryOptions({ queryKey: [...root(), 'goals'], queryFn: organizationApi.goals })
export const wishlistQuery = (filters: WishlistFilters = {}) =>
  queryOptions({
    queryKey: [...root(), 'wishlist', filters],
    queryFn: () => organizationApi.wishlist(filters),
  })
export const wishlistSummaryQuery = (month: string) =>
  queryOptions({
    queryKey: [...root(), 'wishlist-summary', month],
    queryFn: () => organizationApi.wishlistSummary(month),
  })
export const notificationsQuery = () =>
  queryOptions({ queryKey: [...root(), 'notifications'], queryFn: organizationApi.notifications })
export const useOrganizationMutation = <T, TResult>(mutationFn: (input: T) => Promise<TResult>) => {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => client.invalidateQueries({ queryKey: root() }),
  })
}
