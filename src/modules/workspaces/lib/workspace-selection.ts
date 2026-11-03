const ACTIVE_WORKSPACE_KEY = 'active-workspace-uuid'

export const getActiveWorkspaceUuid = () => {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(ACTIVE_WORKSPACE_KEY) || ''
}

export const setActiveWorkspaceUuid = (workspaceUuid: string) => {
  localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceUuid)
}

export const clearActiveWorkspaceUuid = () => {
  localStorage.removeItem(ACTIVE_WORKSPACE_KEY)
}
