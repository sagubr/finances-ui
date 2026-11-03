import { Store } from '@tanstack/store'
import { getActiveWorkspaceUuid, setActiveWorkspaceUuid } from '../lib/workspace-selection'
import type { Workspace, WorkspaceRole } from '../models/workspace.types'

export type WorkspaceAbility =
  'workspace.view' | 'workspace.administer' | 'members.manage' | 'ownership.transfer'

type WorkspaceAccessState = {
  readonly activeWorkspaceId: string
  readonly workspaces: readonly Workspace[]
  readonly isLoaded: boolean
}

export const workspaceAccessStore = new Store<WorkspaceAccessState>({
  activeWorkspaceId: getActiveWorkspaceUuid(),
  workspaces: [],
  isLoaded: false,
})

const abilitiesByRole: Record<WorkspaceRole, ReadonlySet<WorkspaceAbility>> = {
  OWNER: new Set<WorkspaceAbility>([
    'workspace.view',
    'workspace.administer',
    'members.manage',
    'ownership.transfer',
  ]),
  EDITOR: new Set<WorkspaceAbility>(['workspace.view']),
  VIEWER: new Set<WorkspaceAbility>(['workspace.view']),
}

export const setWorkspaceAccessList = (workspaces: readonly Workspace[]) => {
  const storedId = getActiveWorkspaceUuid()
  const activeWorkspaceId = workspaces.some(({ id }) => id === storedId)
    ? storedId
    : (workspaces[0]?.id ?? '')
  if (activeWorkspaceId) setActiveWorkspaceUuid(activeWorkspaceId)
  workspaceAccessStore.setState((state) => ({
    ...state,
    activeWorkspaceId,
    workspaces,
    isLoaded: true,
  }))
}

export const isWorkspaceAccessReady = (state = workspaceAccessStore.state): boolean =>
  state.isLoaded

export const setWorkspaceAccessActiveId = (activeWorkspaceId: string) => {
  setActiveWorkspaceUuid(activeWorkspaceId)
  workspaceAccessStore.setState((state) => ({ ...state, activeWorkspaceId }))
}

export const getActiveWorkspaceRole = (state = workspaceAccessStore.state) =>
  state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId)?.role

export const getActiveWorkspaceBaseCurrency = (state = workspaceAccessStore.state) =>
  state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId)?.baseCurrency

export const canInWorkspace = (
  ability: WorkspaceAbility,
  state = workspaceAccessStore.state,
): boolean => {
  const role = getActiveWorkspaceRole(state)
  return role ? abilitiesByRole[role].has(ability) : false
}
