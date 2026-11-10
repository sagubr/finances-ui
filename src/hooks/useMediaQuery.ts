import { useCallback, useSyncExternalStore } from 'react'

export const useMediaQuery = (query: string, serverMatches = false) => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener('change', onStoreChange)

      return () => mediaQuery.removeEventListener('change', onStoreChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])
  const getServerSnapshot = useCallback(() => serverMatches, [serverMatches])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
