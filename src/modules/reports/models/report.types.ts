export type AnnualMonth = {
  month: string
  incomeCents: number
  expenseCents: number
  netCents: number
  plannedIncomeCents: number
  plannedExpenseCents: number
  plannedNetCents: number
}
export type AnnualReport = {
  year: number
  months: AnnualMonth[]
  totals: { incomeCents: number; expenseCents: number; netCents: number }
  calculatedAt: string
  dataVersion: number
}
export type ComparisonReport = {
  current: { month: string; incomeCents: number; expenseCents: number }
  previous: { month: string; incomeCents: number; expenseCents: number }
  variation: { income: { bps: number | null }; expense: { bps: number | null } }
  calculatedAt: string
}
export type CashflowForecast = {
  from: string
  to: string
  items: {
    date: string
    plannedIncomeCents: number
    plannedExpenseCents: number
    plannedInvestmentCents: number
    plannedNetCents: number
  }[]
  totals: {
    plannedIncomeCents: number
    plannedExpenseCents: number
    plannedInvestmentCents: number
    plannedNetCents: number
  }
  calculatedAt: string
}
export type CategorySpending = {
  month: string
  items: {
    categoryId: string
    categoryName: string
    color: string | null
    realizedCents: number
    plannedCents: number
    totalCents: number
  }[]
  totals: { realizedCents: number; plannedCents: number; totalCents: number }
  calculatedAt: string
}
export type ExportJob = {
  id: string
  report: 'TRANSACTIONS' | 'ANNUAL'
  format: 'CSV' | 'JSON'
  status: 'PENDING' | 'RUNNING' | 'READY' | 'FAILED' | 'EXPIRED' | 'CANCELLED'
  progress: number
  errorCode: string | null
}

export type ExportAccepted = {
  id: string
  status: 'PENDING'
}
