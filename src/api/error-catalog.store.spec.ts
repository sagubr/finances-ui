import { afterEach, describe, expect, it } from 'vitest'
import { ApiClientError } from './api-client.error'
import {
  clearErrorCatalog,
  findErrorDocumentation,
  installErrorCatalog,
} from './error-catalog.store'
import { extractErrorMessage } from './utils'

const documentedError = {
  code: 'VIEW_STABLE_ORDER_REQUIRED',
  statusCode: 422,
  module: 'validation',
  translationKey: 'errors.view.stable.order.required',
  description: 'A visão precisa de uma ordenação estável.',
  resolution: 'Adicione uma ordenação determinística.',
} as const

afterEach(clearErrorCatalog)

describe('frontend error catalog', () => {
  it('indexes documentation by the stable API code', () => {
    installErrorCatalog([documentedError])
    expect(findErrorDocumentation(documentedError.code)).toEqual(documentedError)
  })

  it('keeps the documented metadata on normalized client errors', () => {
    installErrorCatalog([documentedError])
    const error = new ApiClientError({
      message: documentedError.description,
      status: documentedError.statusCode,
      code: documentedError.code,
      documentation: findErrorDocumentation(documentedError.code),
    })

    expect(extractErrorMessage(error, 'Falha desconhecida.')).toBe(documentedError.description)
    expect(error.documentation?.resolution).toBe('Adicione uma ordenação determinística.')
  })

  it('returns no documentation for unknown or not-yet-loaded codes', () => {
    expect(findErrorDocumentation('UNKNOWN_ERROR')).toBeUndefined()
    expect(findErrorDocumentation()).toBeUndefined()
  })
})
