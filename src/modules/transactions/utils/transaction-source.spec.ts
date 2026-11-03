import { describe, expect, it } from 'vitest'
import type { Transaction } from '../models/transaction.types'
import {
  deduplicateTransferLegs,
  isCardManagedTransaction,
  isManualCardPurchase,
  isStatementProjection,
} from './transaction-source'

const transaction = (sourceModule: string | null) => ({ sourceModule }) as Transaction

describe('transaction source compatibility', () => {
  it.each(['CC_PURCHASE', 'CC'])('abre compra manual para a origem %s', (source) => {
    expect(isManualCardPurchase(transaction(source))).toBe(true)
  })

  it.each(['CC_PROJECTION', 'CCP'])('identifica projeção pagável %s', (source) => {
    expect(isStatementProjection(transaction(source))).toBe(true)
  })

  it.each([
    'CC_PURCHASE',
    'CC_INSTALLMENT',
    'CC_RECURRING',
    'CC_PAYMENT',
    'CC_PROJECTION',
    'CC',
    'CCRC',
    'CCP',
  ])('protege lançamento gerenciado pelo cartão %s', (source) => {
    expect(isCardManagedTransaction(transaction(source))).toBe(true)
  })

  it('protege fontes futuras de cartão de ações genéricas incompatíveis', () => {
    expect(isCardManagedTransaction(transaction('CC_FUTURE'))).toBe(true)
  })

  it('exibe apenas um registro por par de transferência', () => {
    const firstLeg = {
      id: 'debit',
      sourceModule: 'TX',
      sourcePublicId: 'transfer-a',
    } as Transaction
    const secondLeg = { ...firstLeg, id: 'credit' }
    const ordinary = { id: 'expense', sourceModule: null, sourcePublicId: null } as Transaction

    expect(deduplicateTransferLegs([firstLeg, secondLeg, ordinary]).map(({ id }) => id)).toEqual([
      'debit',
      'expense',
    ])
  })
})
