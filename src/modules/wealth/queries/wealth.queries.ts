import { workspaceAccessStore } from '@/modules/workspaces/store/workspace-access.store'
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { wealthApi } from '../api/wealth.api'
const root = () => ['wealth', workspaceAccessStore.state.activeWorkspaceId] as const
export const investmentAccountsQuery = () =>
  queryOptions({ queryKey: [...root(), 'accounts'], queryFn: wealthApi.accounts })
export const instrumentsQuery = (q = '') =>
  queryOptions({ queryKey: ['market-instruments', q], queryFn: () => wealthApi.instruments(q) })
export const positionsQuery = () =>
  queryOptions({ queryKey: [...root(), 'positions'], queryFn: wealthApi.positions })
export const assetsQuery = () =>
  queryOptions({ queryKey: [...root(), 'assets'], queryFn: wealthApi.assets })
export const netWorthQuery = () =>
  queryOptions({ queryKey: [...root(), 'net-worth'], queryFn: () => wealthApi.netWorth() })
export const useWealthMutation = <T, TResult>(mutationFn: (input: T) => Promise<TResult>) => {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => client.invalidateQueries({ queryKey: root() }),
  })
}
