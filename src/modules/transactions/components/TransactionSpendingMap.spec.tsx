import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { TransactionMap } from '../models/transaction.types'
import { TransactionSpendingMap } from './TransactionSpendingMap'

vi.mock('@/components/ui/map', () => ({
  Map: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MapClusterLayer: () => <div data-testid="expense-points" />,
  MapControls: () => null,
  useMap: () => ({ map: null, isLoaded: false }),
}))

const data: TransactionMap = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: '019a4c64-9a81-7000-8000-000000000001',
      geometry: { type: 'Point', coordinates: [-46.63, -23.55] },
      properties: {
        transactionId: '019a4c64-9a81-7000-8000-000000000001',
        accountId: '019a4c64-9a81-7000-8000-000000000002',
        accountName: 'Conta principal',
        categoryId: '019a4c64-9a81-7000-8000-000000000003',
        categoryName: 'Mercado',
        categoryColor: '#16a34a',
        description: 'Supermercado',
        amountCents: 28_000,
        currency: 'BRL',
        occurredOn: '2026-11-09',
        status: 'CONFIRMED',
        sourceModule: null,
      },
    },
  ],
  summary: {
    transactionCount: 2,
    locatedCount: 1,
    unlocatedCount: 1,
    locatedAmountCents: 28_000,
  },
}

describe('TransactionSpendingMap', () => {
  it('shows a ranked spending panel and category legend', () => {
    render(
      <TransactionSpendingMap
        data={data}
        currency="BRL"
        isLoading={false}
        error={null}
        isRetrying={false}
        onRetry={vi.fn()}
      />,
    )

    expect(screen.getByText('Maiores gastos localizados')).not.toBeNull()
    expect(screen.getAllByText('Supermercado').length).toBeGreaterThan(0)
    expect(screen.getByText('Categorias')).not.toBeNull()
    expect(screen.getByText('1 sem localização')).not.toBeNull()
    expect(screen.getByTestId('expense-points')).not.toBeNull()
  })
})
