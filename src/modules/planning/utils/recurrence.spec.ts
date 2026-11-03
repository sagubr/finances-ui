import { describe, expect, it } from 'vitest'
import { resolveRecurringTimezone } from './recurrence'

describe('resolveRecurringTimezone', () => {
  it('preserva o fuso da regra durante a edição', () => {
    expect(resolveRecurringTimezone('America/Manaus', 'America/Sao_Paulo')).toBe('America/Manaus')
  })

  it('usa o fuso do workspace durante a criação', () => {
    expect(resolveRecurringTimezone(undefined, 'America/Sao_Paulo')).toBe('America/Sao_Paulo')
  })
})
