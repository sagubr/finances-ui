import { describe, expect, it } from 'vitest'
import { ApiClientError } from './api-client.error'
import { extractErrorMessage } from './utils'

describe('extractErrorMessage', () => {
  it.each(['Network Error', 'Failed to fetch', 'Load failed'])(
    'substitui erro de transporte cru: %s',
    (message) => {
      expect(extractErrorMessage(new Error(message), 'Mensagem amigável.')).toBe(
        'Mensagem amigável.',
      )
    },
  )

  it('preserva mensagens especializadas da API', () => {
    const error = new ApiClientError({
      message: 'A visão exige uma ordenação estável.',
      code: 'VIEW_STABLE_ORDER_REQUIRED',
    })

    expect(extractErrorMessage(error, 'Mensagem padrão.')).toBe(
      'A visão exige uma ordenação estável.',
    )
  })
})
