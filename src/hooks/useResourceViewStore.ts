import { Store, useStore } from '@tanstack/react-store'
import { useCallback } from 'react'
import { useIsMobile } from './useMobile'

const STORAGE_KEY = 'resource-view-modes'
type ViewMode = 'list' | 'grid'
type TransactionViewMode = ViewMode | 'map'
type ViewState = Readonly<{ modes: Readonly<Record<string, TransactionViewMode>> }>

const readModes = (): Readonly<Record<string, TransactionViewMode>> => {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<
      string,
      TransactionViewMode
    >
  } catch {
    return {}
  }
}

const resourceViewStore = new Store<ViewState>({ modes: readModes() })

export const useResourceViewMode = (resource: string, fallback: ViewMode = 'list') => {
  const isMobile = useIsMobile()
  const storedMode = useStore(resourceViewStore, (state) => state.modes[resource] ?? fallback)
  const mode = storedMode === 'map' ? fallback : storedMode
  const setMode = useCallback(
    (nextMode: ViewMode) => {
      if (isMobile) return
      resourceViewStore.setState((state) => {
        const modes = { ...state.modes, [resource]: nextMode }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(modes))
        } catch {
          // Storage may be unavailable (private mode, quota, or hardened browsers).
        }
        return { modes }
      })
    },
    [isMobile, resource],
  )
  return [isMobile ? 'grid' : mode, setMode] as const
}

export const useTransactionViewMode = (resource: string, fallback: ViewMode = 'list') => {
  const isMobile = useIsMobile()
  const mode = useStore(resourceViewStore, (state) => state.modes[resource] ?? fallback)
  const setMode = useCallback(
    (nextMode: TransactionViewMode) => {
      resourceViewStore.setState((state) => {
        const modes = { ...state.modes, [resource]: nextMode }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(modes))
        } catch {
          // Storage may be unavailable (private mode, quota, or hardened browsers).
        }
        return { modes }
      })
    },
    [resource],
  )
  return [isMobile && mode !== 'map' ? 'grid' : mode, setMode] as const
}
