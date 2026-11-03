import { useStore } from '@tanstack/react-store'
import type { ReactNode } from 'react'
import {
  canInWorkspace,
  getActiveWorkspaceRole,
  workspaceAccessStore,
  type WorkspaceAbility,
} from '../store/workspace-access.store'

export const useCan = (ability: WorkspaceAbility) =>
  useStore(workspaceAccessStore, (state) => canInWorkspace(ability, state))

export const useActiveWorkspaceRole = () =>
  useStore(workspaceAccessStore, (state) => getActiveWorkspaceRole(state))

export const useIsWorkspaceAccessReady = () =>
  useStore(workspaceAccessStore, (state) => state.isLoaded)

export function Can({
  ability,
  children,
  fallback = null,
  loadingFallback = null,
}: {
  readonly ability: WorkspaceAbility
  readonly children: ReactNode
  readonly fallback?: ReactNode
  readonly loadingFallback?: ReactNode
}) {
  const isLoaded = useIsWorkspaceAccessReady()
  const allowed = useCan(ability)

  if (!isLoaded) {
    return loadingFallback
  }

  return allowed ? children : fallback
}
