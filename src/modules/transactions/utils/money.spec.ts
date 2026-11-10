import { describe, expect, it } from 'vitest'
import {
  formatCentsForInput,
  maskMoneyInput,
  parseBalanceToCents,
  parseMoneyToCents,
  parseNonNegativeMoneyToCents,
} from './money'

describe('money parsers', () => {
  it('parses decimal user input without floating point multiplication', () => {
    expect(parseMoneyToCents('10,05')).toBe(1005)
    expect(parseMoneyToCents('0.01')).toBe(1)
  })

  it('rejects invalid or non-positive transaction amounts', () => {
    expect(parseMoneyToCents('0')).toBeNull()
    expect(parseMoneyToCents('-1')).toBeNull()
    expect(parseMoneyToCents('1.234')).toBeNull()
  })

  it('accepts signed and zero opening balances', () => {
    expect(parseBalanceToCents('-12,50')).toBe(-1250)
    expect(parseBalanceToCents('0')).toBe(0)
  })

  it('accepts zero and converts whole budget values to cents', () => {
    expect(parseNonNegativeMoneyToCents('0')).toBe(0)
    expect(parseNonNegativeMoneyToCents('50000')).toBe(5_000_000)
  })

  it('masks typed digits using Brazilian monetary formatting', () => {
    expect(maskMoneyInput('1')).toBe('0,01')
    expect(maskMoneyInput('123456')).toBe('1.234,56')
    expect(maskMoneyInput('-123456', true)).toBe('-1.234,56')
  })

  it('formats integer cents returned by the API for editing', () => {
    expect(formatCentsForInput(123456)).toBe('1.234,56')
    expect(formatCentsForInput(-5)).toBe('-0,05')
    expect(formatCentsForInput(0)).toBe('0,00')
  })

  it('parses masked values without losing precision', () => {
    expect(parseMoneyToCents('1.234,56')).toBe(123456)
    expect(parseBalanceToCents('-1.234,56')).toBe(-123456)
  })
})
