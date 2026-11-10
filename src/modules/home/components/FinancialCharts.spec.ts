import type { AnnualMonth, CashflowForecast } from '@/modules/reports/models/report.types'
import { render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { AnnualEvolutionChart, groupForecastByWeek, linearTrend } from './FinancialCharts'

const forecast = (items: CashflowForecast['items']): CashflowForecast => ({
  from: '2026-11-01',
  to: '2026-11-30',
  items,
  totals: {
    plannedIncomeCents: 0,
    plannedExpenseCents: 0,
    plannedInvestmentCents: 0,
    plannedNetCents: 0,
  },
  calculatedAt: '2026-11-09T12:00:00.000Z',
})

const item = (
  date: string,
  plannedIncomeCents: number,
  plannedExpenseCents: number,
): CashflowForecast['items'][number] => ({
  date,
  plannedIncomeCents,
  plannedExpenseCents,
  plannedInvestmentCents: 0,
  plannedNetCents: plannedIncomeCents - plannedExpenseCents,
})

describe('FinancialCharts', () => {
  it('agrupa o fluxo planejado por semana sem perder valores', () => {
    const points = groupForecastByWeek(
      forecast([
        item('2026-11-01', 10_000, 2_000),
        item('2026-11-07', 5_000, 1_000),
        item('2026-11-08', 3_000, 500),
        item('2026-11-30', 0, 9_000),
      ]),
    )

    expect(points).toEqual([
      { key: 'week-1', label: '1–7', incomeCents: 15_000, expenseCents: 3_000 },
      { key: 'week-8', label: '8–14', incomeCents: 3_000, expenseCents: 500 },
      { key: 'week-29', label: '29–30', incomeCents: 0, expenseCents: 9_000 },
    ])
  })

  it('calcula uma tendência linear das despesas', () => {
    expect(linearTrend([10, 20, 30, 40])).toEqual([10, 20, 30, 40])
    expect(linearTrend([40, 30, 20, 10])).toEqual([40, 30, 20, 10])
  })

  it('preserva largura legível e rolagem horizontal para os doze meses', () => {
    const months: AnnualMonth[] = Array.from({ length: 12 }, (_, index) => ({
      month: `2026-${String(index + 1).padStart(2, '0')}`,
      incomeCents: 10_000 + index,
      expenseCents: 5_000 + index,
      netCents: 5_000,
      plannedIncomeCents: 0,
      plannedExpenseCents: 0,
      plannedNetCents: 0,
    }))

    render(createElement(AnnualEvolutionChart, { months, currency: 'BRL' }))

    const viewport = screen.getByRole('group', { name: 'Gráfico de receitas e despesas' })
    expect(viewport.className).toContain('overflow-x-auto')
    expect((viewport.firstElementChild as HTMLElement).style.minWidth).toBe('504px')
    expect(screen.getAllByRole('button')).toHaveLength(12)
    expect(screen.getByText('Tendência das despesas')).not.toBeNull()
  })
})
