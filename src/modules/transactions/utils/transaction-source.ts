import type { Transaction } from '../models/transaction.types'

export const transactionSources = {
  cardPurchase: 'CC_PURCHASE',
  cardInstallment: 'CC_INSTALLMENT',
  cardPayment: 'CC_PAYMENT',
  cardRecurring: 'CC_RECURRING',
  cardProjection: 'CC_PROJECTION',
  legacyCard: 'CC',
  legacyCardRecurring: 'CCRC',
  legacyCardProjection: 'CCP',
} as const

export const isCardManagedTransaction = (transaction: Transaction) =>
  transaction.sourceModule?.startsWith('CC') ?? false

export const isManualCardPurchase = (transaction: Transaction) =>
  transaction.sourceModule === transactionSources.cardPurchase ||
  transaction.sourceModule === transactionSources.legacyCard

export const isStatementProjection = (transaction: Transaction) =>
  transaction.sourceModule === transactionSources.cardProjection ||
  transaction.sourceModule === transactionSources.legacyCardProjection

export const deduplicateTransferLegs = (transactions: readonly Transaction[]) => {
  const seenTransfers = new Set<string>()
  return transactions.filter((transaction) => {
    if (transaction.sourceModule !== 'TX' || !transaction.sourcePublicId) return true
    if (seenTransfers.has(transaction.sourcePublicId)) return false
    seenTransfers.add(transaction.sourcePublicId)
    return true
  })
}
