import { afterEach, describe, expect, it } from 'vitest'
import { competenceStore, setCompetenceMonth } from './competence.store'

const originalMonth = competenceStore.state.month

describe('competence store', () => {
  afterEach(() => setCompetenceMonth(originalMonth))

  it('compartilha e persiste a competência selecionada', () => {
    setCompetenceMonth('2027-04')

    expect(competenceStore.state.month).toBe('2027-04')
    expect(localStorage.getItem('financial-competence-month')).toBe('2027-04')
  })

  it('ignora competências inválidas', () => {
    const current = competenceStore.state.month

    setCompetenceMonth('2027-13')

    expect(competenceStore.state.month).toBe(current)
  })
})
