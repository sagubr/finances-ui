import { describe, expect, it } from 'vitest'
import { matchesSearchText, normalizeSearchText } from './search-text'

describe('search text', () => {
  it('ignora caixa e acentos em português', () => {
    const name = 'Faturamento - VISÃO EMBALAGEM'

    expect(matchesSearchText(name, 'embalagem')).toBe(true)
    expect(matchesSearchText(name, 'visão')).toBe(true)
    expect(matchesSearchText(name, 'visao')).toBe(true)
  })

  it('normaliza espaços e valores ausentes', () => {
    expect(normalizeSearchText('  São Paulo  ')).toBe('sao paulo')
    expect(normalizeSearchText(undefined)).toBe('')
  })
})
