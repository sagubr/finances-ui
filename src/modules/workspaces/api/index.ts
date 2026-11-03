import api from '@/api/client'
import type { Workspace } from '../models/workspace.types'
import { setWorkspaceAccessList } from '../store/workspace-access.store'

export const workspacesApi = {
  list: async (): Promise<Workspace[]> => {
    const { data } = await api.get<{ items: Workspace[] }>('/workspaces')
    setWorkspaceAccessList(data.items)
    return data.items
  },
  create: async (input: { name: string; timezone: string; baseCurrency: string }) => {
    const { data } = await api.post<Workspace>('/workspaces', input)
    return data
  },
}
