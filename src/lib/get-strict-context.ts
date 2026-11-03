import * as React from 'react'

/**
 * Creates a strictly-typed React Context + hook pair.
 * The hook throws a descriptive error if used outside the Provider,
 * instead of returning `undefined` silently.
 *
 * @param name - Used in the error message for easy debugging.
 * @returns [Provider, useContext] tuple.
 *
 * @example
 * const [SidebarProvider, useSidebar] = getStrictContext<SidebarContextProps>('SidebarContext')
 */
export function getStrictContext<T>(name: string) {
  const Context = React.createContext<T | null>(null)

  function useStrictContext(): T {
    const value = React.useContext(Context)
    if (value === null) {
      throw new Error(`[getStrictContext] \`${name}\` must be used within its Provider.`)
    }
    return value
  }

  return [Context.Provider, useStrictContext] as const
}
