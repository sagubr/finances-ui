import { describe, expect, it } from 'vitest'
import { filterResources } from './resource-search'

describe('filterResources', () => {
  const items = [
    { id: '1', name: 'Cartão de crédito', active: true },
    { id: '2', name: 'Poupança', active: false },
  ]

  it('filters resource values ignoring accents and case', () => {
    expect(filterResources(items, 'CARTAO')).toEqual([items[0]])
    expect(filterResources(items, 'poupanca')).toEqual([items[1]])
  })

  it('returns all resources for a blank search', () => {
    expect(filterResources(items, '   ')).toEqual(items)
  })
})
