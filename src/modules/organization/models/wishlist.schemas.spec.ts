import { describe, expect, it } from 'vitest'
import {
  wishlistItemSchema,
  wishlistPurchaseSchema,
  wishlistSummarySchema,
} from './organization.schemas'

describe('wishlist contracts', () => {
  const itemId = '019a6c7f-6d34-7000-8000-000000000001'
  const transactionId = '019a6c7f-6d34-7000-8000-000000000002'

  it('parses a purchased item with an optional transaction link', () => {
    const item = wishlistItemSchema.parse({
      id: itemId,
      name: 'Notebook',
      url: 'https://example.com/notebook',
      estimatedPriceCents: 500_000,
      currency: 'BRL',
      priority: 8,
      reason: 'Trabalho',
      plannedOn: '2026-11-20',
      status: 'PURCHASED',
      actualPriceCents: 480_000,
      purchasedOn: '2026-11-10',
      transactionId,
      version: 2,
    })

    expect(item.status).toBe('PURCHASED')
    expect(item.transactionId).not.toBeNull()
  })

  it('keeps summary currencies separated and allows purchases without transactions', () => {
    expect(
      wishlistSummarySchema.parse({
        month: '2026-11',
        totals: [
          { currency: 'BRL', totalCents: 100_000, itemCount: 2 },
          { currency: 'USD', totalCents: 20_000, itemCount: 1 },
        ],
      }).totals,
    ).toHaveLength(2)
    expect(
      wishlistPurchaseSchema.parse({
        itemId,
        transactionId: null,
        repeated: false,
      }).transactionId,
    ).toBeNull()
  })
})
