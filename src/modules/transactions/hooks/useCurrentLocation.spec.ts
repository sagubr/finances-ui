import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { geolocationErrorMessage, useCurrentLocation } from './useCurrentLocation'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('geolocation error messages', () => {
  it('explains permission, availability and timeout failures', () => {
    expect(geolocationErrorMessage(1)).toContain('recusada')
    expect(geolocationErrorMessage(2)).toContain('determinar')
    expect(geolocationErrorMessage(3)).toContain('demorou')
  })

  it('provides a safe fallback for unknown failures', () => {
    expect(geolocationErrorMessage(99)).toContain('Não foi possível')
  })

  it('normalizes the browser position for the transaction contract', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) =>
      success({
        coords: {
          latitude: -23.55052,
          longitude: -46.633308,
          accuracy: 8,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: Date.parse('2026-11-09T18:30:00.000Z'),
        toJSON: () => ({}),
      }),
    )
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    })
    const { result } = renderHook(() => useCurrentLocation())

    let location = null
    await act(async () => {
      location = await result.current.request()
    })

    expect(location).toEqual({
      latitude: -23.55052,
      longitude: -46.633308,
      accuracyMeters: 8,
      capturedAt: '2026-11-09T18:30:00.000Z',
      source: 'DEVICE',
    })
    expect(getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 60_000,
    })
  })
})
