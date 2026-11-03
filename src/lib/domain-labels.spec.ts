import { describe, expect, it } from 'vitest'
import { getDomainLabel } from './domain-labels'

describe('domain labels', () => {
  it('traduz valores técnicos apresentados pela API', () => {
    expect(getDomainLabel('WEEKLY')).toBe('Semanal')
    expect(getDomainLabel('PURCHASE_PENDING')).toBe('Compra pendente')
    expect(getDomainLabel('PREVIEWED')).toBe('Validado')
    expect(getDomainLabel('PAST_DUE')).toBe('Pagamento em atraso')
  })

  it('torna valores desconhecidos legíveis sem alterar o contrato', () => {
    expect(getDomainLabel('CUSTOM_VALUE')).toBe('CUSTOM VALUE')
  })
})
