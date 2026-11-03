import { ApiClientError } from './api-client.error'

export const unwrapSuccessEnvelope = (payload: unknown): unknown => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'success' in payload &&
    payload.success === true &&
    'data' in payload
  )
    return payload.data

  throw new ApiClientError({
    message: 'A API retornou uma resposta incompatível com o contrato esperado.',
    code: 'INVALID_API_RESPONSE',
    details: { expected: '{ success: true, data: unknown }' },
  })
}
