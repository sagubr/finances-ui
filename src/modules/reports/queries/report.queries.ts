import { workspaceAccessStore } from '@/modules/workspaces/store/workspace-access.store'
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsApi } from '../api/reports.api'

const root = () => ['reports', workspaceAccessStore.state.activeWorkspaceId] as const
export const annualReportQuery = (year: number) =>
  queryOptions({ queryKey: [...root(), 'annual', year], queryFn: () => reportsApi.annual(year) })
export const comparisonQuery = (current: string, previous: string) =>
  queryOptions({
    queryKey: [...root(), 'compare', current, previous],
    queryFn: () => reportsApi.compare(current, previous),
  })
export const forecastQuery = (from: string, to: string) =>
  queryOptions({
    queryKey: [...root(), 'forecast', from, to],
    queryFn: () => reportsApi.forecast(from, to),
  })
export const categorySpendingQuery = (month: string) =>
  queryOptions({
    queryKey: [...root(), 'category-spending', month],
    queryFn: () => reportsApi.categorySpending(month),
  })
export const useCreateExport = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: reportsApi.createExport,
    onSuccess: (job) => client.setQueryData([...root(), 'export', job.id], job),
  })
}
