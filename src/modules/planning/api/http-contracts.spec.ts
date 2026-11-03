import { reportsApi } from '@/modules/reports/api/reports.api'
import type { ExportAccepted } from '@/modules/reports/models/report.types'
import { describe, expect, it } from 'vitest'
import type {
  Budget,
  CardPurchase,
  CardPurchaseInput,
  CreateBudgetInput,
  CreateInstallmentInput,
  CreditCard,
  ImportPreview,
  InstallmentPlan,
  Page,
  Statement,
  StatementClose,
  StatementPayment,
  StatementPaymentInput,
  StatementPurchase,
} from '../models/planning.types'
import { planningApi } from './planning.api'

describe('HTTP client contracts', () => {
  it('keeps planning mutations aligned with their API responses', () => {
    const createBudget: (input: CreateBudgetInput) => Promise<Budget> = planningApi.createBudget
    const uploadImport: (file: File) => Promise<ImportPreview> = planningApi.uploadImport
    const createInstallments: (input: CreateInstallmentInput) => Promise<{ id: string }> =
      planningApi.createInstallments
    const listInstallments: () => Promise<Page<InstallmentPlan>> = planningApi.installments
    const createCardPurchase: (
      card: CreditCard,
      input: CardPurchaseInput,
    ) => Promise<CardPurchase> = planningApi.createCardPurchase
    const updateCardPurchase: (
      cardId: string,
      purchase: StatementPurchase,
      input: CardPurchaseInput,
    ) => Promise<CardPurchase> = planningApi.updateCardPurchase
    const deleteCardPurchase: (cardId: string, purchase: StatementPurchase) => Promise<void> =
      planningApi.deleteCardPurchase
    const closeStatement: (statement: Statement) => Promise<StatementClose> =
      planningApi.closeStatement
    const payStatement: (
      statement: Statement,
      input: StatementPaymentInput,
    ) => Promise<StatementPayment> = planningApi.payStatement

    expect(createBudget).toBe(planningApi.createBudget)
    expect(uploadImport).toBe(planningApi.uploadImport)
    expect(createInstallments).toBe(planningApi.createInstallments)
    expect(listInstallments).toBe(planningApi.installments)
    expect(createCardPurchase).toBe(planningApi.createCardPurchase)
    expect(updateCardPurchase).toBe(planningApi.updateCardPurchase)
    expect(deleteCardPurchase).toBe(planningApi.deleteCardPurchase)
    expect(closeStatement).toBe(planningApi.closeStatement)
    expect(payStatement).toBe(planningApi.payStatement)
  })

  it('models an accepted export separately from its later status', () => {
    const createExport: (input: {
      report: 'TRANSACTIONS' | 'ANNUAL'
      format: 'CSV' | 'JSON'
    }) => Promise<ExportAccepted> = reportsApi.createExport

    expect(createExport).toBe(reportsApi.createExport)
  })
})
