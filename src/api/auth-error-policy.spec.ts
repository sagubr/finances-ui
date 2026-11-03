import { describe, expect, it } from 'vitest'
import { shouldTerminateSession } from './auth-error-policy'

describe('shouldTerminateSession', () => {
  it('encerra a sessão quando a API retorna não autorizado', () => {
    expect(shouldTerminateSession(401)).toBe(true)
  })

  it('encerra a sessão quando o SSO está indisponível', () => {
    expect(shouldTerminateSession(503, 'AUTH_SSO_UNAVAILABLE')).toBe(true)
  })

  it('não encerra a sessão por indisponibilidade de outro serviço', () => {
    expect(shouldTerminateSession(503, 'DATA_SOURCE_UNAVAILABLE')).toBe(false)
    expect(shouldTerminateSession(503)).toBe(false)
  })
})
