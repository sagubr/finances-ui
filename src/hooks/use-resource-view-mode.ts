import type { ViewMode } from '@/components/ViewModeToggle'
import { Store, useStore } from '@tanstack/react-store'
import { useCallback } from 'react'

const STORAGE_KEY = 'resource-view-modes'
type ViewState = Readonly<{ modes: Readonly<Record<string, ViewMode>> }>

const readModes = (): Readonly<Record<string, ViewMode>> => {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, ViewMode>
  } catch {
    return {}
  }
}

const resourceViewStore = new Store<ViewState>({ modes: readModes() })

export const useResourceViewMode = (resource: string, fallback: ViewMode = 'list') => {
  const mode = useStore(resourceViewStore, (state) => state.modes[resource] ?? fallback)
  const setMode = useCallback(
    (nextMode: ViewMode) => {
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
  return [mode, setMode] as const
}
