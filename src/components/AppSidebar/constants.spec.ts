import { describe, expect, it } from 'vitest'
import {
  BOTTOM_MORE_ITEMS,
  BOTTOM_MORE_LINKS,
  BOTTOM_PRIMARY_ITEMS,
  NAV_GROUPS,
  NAVIGATION_MODULES,
} from './constants'

describe('navigation module catalog', () => {
  it('keeps at most four stable primary destinations in the mobile navigation', () => {
    expect(BOTTOM_PRIMARY_ITEMS.map(({ id }) => id)).toEqual([
      'dashboard',
      'transactions',
      'financial-structure',
    ])
    expect(BOTTOM_PRIMARY_ITEMS).toHaveLength(3)
  })

  it('derives sidebar groups and mobile overflow from the same modules', () => {
    expect(NAV_GROUPS.map(({ id }) => id)).toEqual(['overview', 'finance', 'insights'])
    expect(BOTTOM_MORE_ITEMS.map(({ id }) => id)).toEqual([
      'wishlist',
      'investments',
      'reports',
      'settings',
    ])
  })

  it('exposes every nested destination in the mobile overflow menu', () => {
    expect(BOTTOM_MORE_LINKS.map(({ id }) => id)).toEqual([
      'wishlist',
      'investments',
      'reports',
      'settings',
      'transaction-planning',
      'financial-categories',
    ])
  })

  it('keeps transaction workflows inside their owning module', () => {
    const transactions = NAVIGATION_MODULES.find(({ id }) => id === 'transactions')
    const settings = NAVIGATION_MODULES.find(({ id }) => id === 'settings')

    expect(transactions?.items?.map(({ id }) => id)).toEqual([
      'transaction-list',
      'transaction-planning',
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

  it('keeps future objectives hidden and exposes investments', () => {
    expect(NAVIGATION_MODULES.some(({ id }) => id === 'objectives')).toBe(false)
    expect(NAVIGATION_MODULES.some(({ id }) => id === 'wealth')).toBe(false)
    expect(NAVIGATION_MODULES.some(({ id }) => id === 'investments')).toBe(true)
  })

  it('keeps report views inside their owning module', () => {
    const reports = NAVIGATION_MODULES.find(({ id }) => id === 'reports')

    expect(reports?.url).toBe('/reports')
    expect(reports?.items).toBeUndefined()
  })

  it('does not expose privacy as an independent navigation module', () => {
    expect(NAVIGATION_MODULES.some(({ id }) => id === 'privacy')).toBe(false)
  })
})
