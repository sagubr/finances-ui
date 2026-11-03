import { describe, expect, it } from 'vitest'
import { ApiClientError } from './api-client.error'
import { unwrapSuccessEnvelope } from './response-envelope'

describe('unwrapSuccessEnvelope', () => {
  it('retorna os dados de um envelope válido', () => {
    expect(unwrapSuccessEnvelope({ success: true, data: { id: 'item' } })).toEqual({ id: 'item' })
  })

  it.each([null, {}, { data: {} }, { success: false, data: {} }])(
    'rejeita resposta fora do contrato: %j',
    (payload) => {
      expect(() => unwrapSuccessEnvelope(payload)).toThrowError(ApiClientError)
    },
  )
})
