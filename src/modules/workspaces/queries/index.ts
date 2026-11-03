import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workspacesApi } from '../api'
import type { Workspace } from '../models/workspace.types'
import { setWorkspaceAccessActiveId } from '../store/workspace-access.store'

export const WORKSPACE_KEYS = {
  all: ['workspaces'] as const,
  list: () => [...WORKSPACE_KEYS.all, 'list'] as const,
}

export const useWorkspaces = (enabled = true) =>
  useQuery({
    queryKey: WORKSPACE_KEYS.list(),
    queryFn: workspacesApi.list,
    staleTime: 60_000,
    enabled,
  })

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: workspacesApi.create,
    onSuccess: (workspace) => {
      queryClient.setQueryData<Workspace[]>(WORKSPACE_KEYS.list(), (current = []) => [
        ...current,
        workspace,
      ])
      setWorkspaceAccessActiveId(workspace.id)
    },
  })
}
