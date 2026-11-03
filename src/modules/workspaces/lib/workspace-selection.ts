const ACTIVE_WORKSPACE_KEY = 'active-workspace-uuid'

export const getActiveWorkspaceUuid = () => {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(ACTIVE_WORKSPACE_KEY) || ''
  } catch {
    return ''
  }
}

export const setActiveWorkspaceUuid = (workspaceUuid: string) => {
  try {
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceUuid)
  } catch {
    // The in-memory store remains usable when persistent storage is unavailable.
  }
}

export const clearActiveWorkspaceUuid = () => {
  try {
    localStorage.removeItem(ACTIVE_WORKSPACE_KEY)
  } catch {
    // Logout must continue even when persistent storage is unavailable.
  }
}
