import { describe, expect, it } from 'vitest'
import { canSettleTransaction } from './transaction-status'

describe('canSettleTransaction', () => {
  it('permite liquidar somente uma transação confirmada', () => {
    expect(canSettleTransaction('CONFIRMED')).toBe(true)
    expect(canSettleTransaction('PLANNED')).toBe(false)
    expect(canSettleTransaction('SETTLED')).toBe(false)
  })
})
