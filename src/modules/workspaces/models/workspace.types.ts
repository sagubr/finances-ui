export type WorkspaceRole = 'OWNER' | 'EDITOR' | 'VIEWER'

export interface Workspace {
  id: string
  name: string
  timezone: string
  baseCurrency: string
  role: WorkspaceRole
}
