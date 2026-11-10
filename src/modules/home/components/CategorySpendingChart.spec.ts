import type { CategorySpending } from '@/modules/reports/models/report.types'
import { describe, expect, it } from 'vitest'
import { buildCategorySlices } from './CategorySpendingChart'

const category = (
  categoryId: string,
  categoryName: string,
  totalCents: number,
  color: string | null = null,
): CategorySpending['items'][number] => ({
  categoryId,
  categoryName,
  color,
  realizedCents: totalCents,
  plannedCents: 0,
  totalCents,
})

describe('CategorySpendingChart', () => {
  it('calcula fatias proporcionais e offsets acumulados', () => {
    const slices = buildCategorySlices(
      [category('a', 'Moradia', 6_000, '#123456'), category('b', 'Mercado', 4_000)],
      'BRL',
    )

    expect(slices).toHaveLength(2)
    expect(slices[0]).toMatchObject({
      categoryName: 'Moradia',
      colorValue: '#123456',
      percentage: 60,
      dashArray: '60 40',
      dashOffset: -0,
    })
    expect(slices[1]).toMatchObject({
      categoryName: 'Mercado',
      percentage: 40,
      dashArray: '40 60',
      dashOffset: -60,
    })
  })

  it('ignora categorias sem valor no período', () => {
    expect(buildCategorySlices([category('a', 'Sem gastos', 0)], 'BRL')).toEqual([])
  })
})
