import { describe, expect, it } from 'vitest'
import { civilDateSchema, publicIdSchema } from './contract.schemas'

describe('contract primitives', () => {
  it('accepts UUIDv7 and rejects other UUID versions', () => {
    expect(publicIdSchema.safeParse('018f1f7e-7b5c-7a3d-8c9e-0123456789ab').success).toBe(true)
    expect(publicIdSchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(false)
  })

  it('rejects impossible civil dates', () => {
    expect(civilDateSchema.safeParse('2026-02-28').success).toBe(true)
    expect(civilDateSchema.safeParse('2026-02-31').success).toBe(false)
  })
})
