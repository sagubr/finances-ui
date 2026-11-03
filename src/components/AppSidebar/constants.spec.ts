import { describe, expect, it } from 'vitest'
import {
  BOTTOM_MORE_ITEMS,
  BOTTOM_PRIMARY_ITEMS,
  NAV_GROUPS,
  NAVIGATION_MODULES,
} from './constants'

describe('navigation module catalog', () => {
  it('keeps at most four stable primary destinations in the mobile navigation', () => {
    expect(BOTTOM_PRIMARY_ITEMS.map(({ id }) => id)).toEqual(['dashboard', 'transactions'])
    expect(BOTTOM_PRIMARY_ITEMS).toHaveLength(2)
  })

  it('derives sidebar groups and mobile overflow from the same modules', () => {
    expect(NAV_GROUPS.map(({ id }) => id)).toEqual(['overview', 'finance', 'insights'])
    expect(BOTTOM_MORE_ITEMS.map(({ id }) => id)).toEqual([
      'financial-structure',
      'reports',
      'settings',
    ])
  })

  it('keeps transaction workflows inside their owning module', () => {
    const transactions = NAVIGATION_MODULES.find(({ id }) => id === 'transactions')
    const settings = NAVIGATION_MODULES.find(({ id }) => id === 'settings')

    expect(transactions?.items?.map(({ id }) => id)).toEqual([
      'transaction-list',
      'transaction-installments',
      'transaction-recurring',
      'transaction-budgets',
      'transaction-cards',
    ])
    expect(settings?.items).toBeUndefined()
  })

  it('exposes accounts and categories as an independent financial module', () => {
    const structure = NAVIGATION_MODULES.find(({ id }) => id === 'financial-structure')

    expect(structure?.items?.map(({ id }) => id)).toEqual([
      'financial-accounts',
      'financial-categories',
    ])
  })

  it('does not expose future objective and wealth modules', () => {
    expect(NAVIGATION_MODULES.some(({ id }) => id === 'objectives')).toBe(false)
    expect(NAVIGATION_MODULES.some(({ id }) => id === 'wealth')).toBe(false)
  })

  it('keeps report views inside their owning module', () => {
    const reports = NAVIGATION_MODULES.find(({ id }) => id === 'reports')

    expect(reports?.items?.map(({ id }) => id)).toEqual(['reports-annual', 'reports-forecast'])
  })

  it('does not expose privacy as an independent navigation module', () => {
    expect(NAVIGATION_MODULES.some(({ id }) => id === 'privacy')).toBe(false)
  })
})
