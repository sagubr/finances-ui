import { workspaceAccessStore } from '@/modules/workspaces/store/workspace-access.store'
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsApi } from '../api/reports.api'

export const reportKeys = {
  root: (workspaceId = workspaceAccessStore.state.activeWorkspaceId) =>
    ['reports', workspaceId] as const,
}
export const annualReportQuery = (year: number) =>
  queryOptions({
    queryKey: [...reportKeys.root(), 'annual', year],
    queryFn: () => reportsApi.annual(year),
  })
export const comparisonQuery = (current: string, previous: string) =>
  queryOptions({
    queryKey: [...reportKeys.root(), 'compare', current, previous],
    queryFn: () => reportsApi.compare(current, previous),
  })
export const forecastQuery = (from: string, to: string) =>
  queryOptions({
    queryKey: [...reportKeys.root(), 'forecast', from, to],
    queryFn: () => reportsApi.forecast(from, to),
  })
export const categorySpendingQuery = (month: string) =>
  queryOptions({
    queryKey: [...reportKeys.root(), 'category-spending', month],
    queryFn: () => reportsApi.categorySpending(month),
  })
export const useCreateExport = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: reportsApi.createExport,
    onSuccess: (job) => client.setQueryData([...reportKeys.root(), 'export', job.id], job),
  })
}
