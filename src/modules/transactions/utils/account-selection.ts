import type { Account } from '../models/transaction.types'

export const accountsForCurrency = (accounts: readonly Account[], currency?: string) =>
  currency ? accounts.filter((account) => account.currency === currency) : accounts
