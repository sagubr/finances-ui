import { createContext, useContext, useState } from 'react'

type Visibility = 'full' | 'collapsed'

type VisibilityProviderProps = {
  children: React.ReactNode
  defaultVisibility?: Visibility
  storageKey?: string
}

type VisibilityProviderState = {
  visibility: Visibility
  setVisibility: (visibility: Visibility) => void
}

const initialState: VisibilityProviderState = {
  visibility: 'collapsed',
  setVisibility: () => null,
}

const VisibilityProviderContext = createContext<VisibilityProviderState>(initialState)

export function VisibilityProvider({
  children,
  defaultVisibility = 'collapsed',
  storageKey = 'vite-ui-visibility',
  ...props
}: VisibilityProviderProps) {
  const [visibility, setVisibility] = useState<Visibility>(() => {
    if (typeof window === 'undefined') return defaultVisibility
    return (window.localStorage.getItem(storageKey) as Visibility) || defaultVisibility
  })

  const value = {
    visibility,
    setVisibility: (newVisibility: Visibility) => {
      localStorage.setItem(storageKey, newVisibility)
      setVisibility(newVisibility)
    },
  }

  return (
    <VisibilityProviderContext.Provider {...props} value={value}>
      {children}
    </VisibilityProviderContext.Provider>
  )
}

export const useVisibility = () => {
  const context = useContext(VisibilityProviderContext)
  return context
}
