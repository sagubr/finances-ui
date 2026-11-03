import type { TransactionStatus } from '../models/transaction.types'

export const canSettleTransaction = (status: TransactionStatus) => status === 'CONFIRMED'
