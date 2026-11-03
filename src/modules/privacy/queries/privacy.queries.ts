import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { privacyApi } from '../api/privacy.api'
const root = ['privacy'] as const
export const documentsQuery = () =>
  queryOptions({ queryKey: [...root, 'documents'], queryFn: privacyApi.documents })
export const accessLogQuery = () =>
  queryOptions({ queryKey: [...root, 'access-log'], queryFn: privacyApi.accessLog })
export const usePrivacyMutation = <T, TResult>(mutationFn: (input: T) => Promise<TResult>) => {
  const client = useQueryClient()
  return useMutation({ mutationFn, onSuccess: () => client.invalidateQueries({ queryKey: root }) })
}
