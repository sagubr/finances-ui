import { useCallback, useState } from 'react'
import type { TransactionLocation } from '../models/transaction.types'

type LocationState = Readonly<{
  isLoading: boolean
  error: string | null
}>

export const geolocationErrorMessage = (code: number): string => {
  if (code === 1) return 'Permissão de localização recusada. Você ainda pode salvar sem o local.'
  if (code === 2) return 'Não foi possível determinar sua localização neste dispositivo.'
  if (code === 3) return 'A localização demorou demais para responder. Tente novamente.'
  return 'Não foi possível obter sua localização agora.'
}

export const useCurrentLocation = () => {
  const [state, setState] = useState<LocationState>({ isLoading: false, error: null })

  const request = useCallback((): Promise<TransactionLocation | null> => {
    if (!('geolocation' in navigator)) {
      setState({
        isLoading: false,
        error: 'Este navegador não oferece suporte à localização.',
      })
      return Promise.resolve(null)
    }

    setState({ isLoading: true, error: null })
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const capturedAt = new Date(position.timestamp)
          const location: TransactionLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters:
              Number.isFinite(position.coords.accuracy) && position.coords.accuracy > 0
                ? position.coords.accuracy
                : null,
            capturedAt: Number.isNaN(capturedAt.getTime())
              ? new Date().toISOString()
              : capturedAt.toISOString(),
            source: 'DEVICE',
          }
          setState({ isLoading: false, error: null })
          resolve(location)
        },
        (error) => {
          setState({ isLoading: false, error: geolocationErrorMessage(error.code) })
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
      )
    })
  }, [])

  return { ...state, request }
}
