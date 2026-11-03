import { beforeEach, describe, expect, it } from 'vitest'
import {
  canInWorkspace,
  setWorkspaceAccessActiveId,
  setWorkspaceAccessList,
} from './workspace-access.store'

const workspace = (id: string, role: 'OWNER' | 'EDITOR' | 'VIEWER') => ({
  id,
  name: role,
  timezone: 'America/Sao_Paulo',
  baseCurrency: 'BRL',
  role,
})

describe('workspace access store', () => {
  beforeEach(() =>
    setWorkspaceAccessList([
      workspace('owner-workspace', 'OWNER'),
      workspace('editor-workspace', 'EDITOR'),
      workspace('viewer-workspace', 'VIEWER'),
    ]),
  )

  it('grants workspace administration and ownership transfer only to the owner', () => {
    setWorkspaceAccessActiveId('owner-workspace')
    expect(canInWorkspace('workspace.administer')).toBe(true)
    expect(canInWorkspace('ownership.transfer')).toBe(true)
  })

  it.each(['EDITOR', 'VIEWER'] as const)('keeps administration hidden from %s', (role) => {
    setWorkspaceAccessActiveId(`${role.toLowerCase()}-workspace`)
    expect(canInWorkspace('workspace.view')).toBe(true)
    expect(canInWorkspace('workspace.administer')).toBe(false)
    expect(canInWorkspace('ownership.transfer')).toBe(false)
  })
})
