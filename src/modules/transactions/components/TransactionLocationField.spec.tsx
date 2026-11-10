import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TransactionLocationField } from './TransactionLocationField'

const { request } = vi.hoisted(() => ({ request: vi.fn() }))

vi.mock('../hooks/useCurrentLocation', () => ({
  useCurrentLocation: () => ({ isLoading: false, error: null, request }),
}))

vi.mock('./TransactionLocationMap', () => ({
  TransactionLocationMap: () => <div>Mapa</div>,
}))

const location = {
  latitude: -23.55052,
  longitude: -46.633308,
  accuracyMeters: 8,
  capturedAt: '2026-11-09T18:30:00.000Z',
  source: 'DEVICE' as const,
}

describe('TransactionLocationField', () => {
  beforeEach(() => {
    request.mockReset()
  })

  it('captures location automatically for a new expense', async () => {
    request.mockResolvedValue(location)
    const onChange = vi.fn()

    render(
      <TransactionLocationField
        value={null}
        occurredOn="2026-11-09"
        autoCapture
        onChange={onChange}
      />,
    )

    await waitFor(() => expect(request).toHaveBeenCalledOnce())
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(location))
  })

  it('does not replace location automatically while editing', async () => {
    const onChange = vi.fn()

    render(
      <TransactionLocationField
        value={null}
        occurredOn="2026-11-09"
        autoCapture={false}
        onChange={onChange}
      />,
    )

    await Promise.resolve()
    expect(request).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps the map collapsed until the user chooses to adjust the location', async () => {
    render(
      <TransactionLocationField
        value={location}
        occurredOn="2026-11-09"
        autoCapture={false}
        onChange={vi.fn()}
      />,
    )

    expect(screen.queryByText('Mapa')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Ajustar localização' }))
    expect(await screen.findByText('Mapa')).not.toBeNull()
  })
})
