import { describe, expect, it } from 'vitest'
import { competenceFromDate } from './competence'

describe('competenceFromDate', () => {
  it('derives competence from the transaction date instead of the selected global month', () => {
    expect(competenceFromDate('2027-01-15')).toBe('2027-01')
  })
})
