import apiClient from '@/api/client'
import {
  annualReportSchema,
  cashflowForecastSchema,
  categorySpendingSchema,
  comparisonReportSchema,
  exportAcceptedSchema,
  exportJobSchema,
} from '../models/report.schemas'
import type {
  AnnualReport,
  CashflowForecast,
  CategorySpending,
  ComparisonReport,
  ExportAccepted,
  ExportJob,
} from '../models/report.types'

export const reportsApi = {
  annual: async (year: number): Promise<AnnualReport> =>
    annualReportSchema.parse((await apiClient.get('/reports/annual', { params: { year } })).data),
  compare: async (current: string, previous: string): Promise<ComparisonReport> =>
    comparisonReportSchema.parse(
      (await apiClient.get('/reports/compare', { params: { current, previous } })).data,
    ),
  forecast: async (from: string, to: string): Promise<CashflowForecast> =>
    cashflowForecastSchema.parse(
      (await apiClient.get('/reports/cashflow-forecast', { params: { from, to } })).data,
    ),
  categorySpending: async (month: string): Promise<CategorySpending> =>
    categorySpendingSchema.parse(
      (await apiClient.get('/reports/category-spending', { params: { month } })).data,
    ),
  createExport: async (input: {
    report: 'TRANSACTIONS' | 'ANNUAL'
    format: 'CSV' | 'JSON'
  }): Promise<ExportAccepted> =>
    exportAcceptedSchema.parse(
      (
        await apiClient.post(
          '/exports',
          { ...input, filters: {} },
          { headers: { 'idempotency-key': crypto.randomUUID() } },
        )
      ).data,
    ),
  exportStatus: async (id: string): Promise<ExportJob> =>
    exportJobSchema.parse((await apiClient.get(`/exports/${id}`)).data),
}
