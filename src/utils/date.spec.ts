import { describe, expect, it } from 'vitest'
import {
  formatCompetencePtBr,
  formatDatePtBr,
  formatDateTimePtBr,
  parseCivilDate,
  toCivilDate,
} from './date'

describe('date formatters', () => {
  it('formats civil dates without timezone conversion', () => {
    expect(formatDatePtBr('2027-01-05')).toBe('05/01/2027')
  })

  it('formats competences in pt-BR order', () => {
    expect(formatCompetencePtBr('2027-01')).toBe('01/2027')
  })

  it('formats timestamps with date and time', () => {
    expect(formatDateTimePtBr('2027-01-05T15:30:00')).toMatch(/^05\/01\/2027, 15:30$/)
  })

  it('round-trips a civil date without changing its month or day', () => {
    expect(toCivilDate(parseCivilDate('2026-12-15'))).toBe('2026-12-15')
  })
})
