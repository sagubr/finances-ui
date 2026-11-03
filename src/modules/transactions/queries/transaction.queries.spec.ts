import { describe, expect, it } from 'vitest'
import { transactionKeys } from './transaction.queries'

describe('transaction query keys', () => {
  it('isolates tenant data by workspace and filters', () => {
    const first = transactionKeys.list('workspace-a', { month: '2026-11' })
    const second = transactionKeys.list('workspace-b', { month: '2026-11' })
    const anotherMonth = transactionKeys.list('workspace-a', { month: '2026-12' })

    expect(first).not.toEqual(second)
    expect(first).not.toEqual(anotherMonth)
  })
})
