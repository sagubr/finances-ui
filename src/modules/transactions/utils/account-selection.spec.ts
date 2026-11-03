import { describe, expect, it } from 'vitest'
import type { Account } from '../models/transaction.types'
import { accountsForCurrency } from './account-selection'

const account = (id: string, currency: string) => ({ id, currency }) as Account

describe('accountsForCurrency', () => {
  it('preserva todas as contas ao criar um lançamento', () => {
    const accounts = [account('brl', 'BRL'), account('usd', 'USD')]
    expect(accountsForCurrency(accounts)).toEqual(accounts)
  })

  it('limita a troca de conta à moeda original durante a edição', () => {
    expect(
      accountsForCurrency([account('brl', 'BRL'), account('usd', 'USD')], 'BRL').map(
        ({ id }) => id,
      ),
    ).toEqual(['brl'])
  })
})
