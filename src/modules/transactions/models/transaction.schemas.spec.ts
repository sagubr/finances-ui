import { describe, expect, it } from 'vitest'
import { transactionLocationSchema, transactionMapSchema } from './transaction.schemas'

const location = {
  latitude: -23.55052,
  longitude: -46.633308,
  accuracyMeters: 15,
  capturedAt: '2026-11-09T18:30:00.000Z',
  source: 'DEVICE' as const,
}

describe('transaction location schema', () => {
  it('accepts browser geolocation data', () => {
    expect(transactionLocationSchema.parse(location)).toEqual(location)
  })

  it('rejects invalid coordinate ranges', () => {
    expect(transactionLocationSchema.safeParse({ ...location, latitude: 91 }).success).toBe(false)
    expect(transactionLocationSchema.safeParse({ ...location, longitude: -181 }).success).toBe(
      false,
    )
  })
})

describe('transactionMapSchema', () => {
  it('parses a competence feature collection', () => {
    const result = transactionMapSchema.safeParse({
      type: 'FeatureCollection',
      features: [],
      summary: {
        transactionCount: 3,
        locatedCount: 0,
        unlocatedCount: 3,
        locatedAmountCents: 0,
      },
    })

    expect(result.success).toBe(true)
  })
})
