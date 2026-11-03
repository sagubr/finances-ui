import { setWorkspaceAccessActiveId } from '@/modules/workspaces/store/workspace-access.store'
import { describe, expect, it } from 'vitest'
import { planningKeys } from './planning.queries'

describe('planning query keys', () => {
  it('isolates tenant data by workspace', () => {
    setWorkspaceAccessActiveId('workspace-a')
    const first = planningKeys.budgets('2026-11')
    setWorkspaceAccessActiveId('workspace-b')
    const second = planningKeys.budgets('2026-11')
    expect(first).not.toEqual(second)
  })

  it('isolates budget months', () => {
    setWorkspaceAccessActiveId('workspace-a')
    expect(planningKeys.budgets('2026-11')).not.toEqual(planningKeys.budgets('2026-12'))
  })
})
