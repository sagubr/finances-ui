import { logoutUser, validateUserToken } from '@/api/auth'
import type { SessionResponse } from '@/api/auth/type'
import { registerSessionExpiredHandler } from '@/api/session-lifecycle'
import { isAuthRoute } from '@/lib/auth-routes'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type AuthData = Readonly<{
  userId: string
  user: string
  email: string
}>

export type Auth = Readonly<{ isAuthenticated: boolean; data: AuthData | null }>

type AuthContextState = Readonly<{
  auth: Auth
  isLoading: boolean
  logout: (saveRedirect?: boolean) => Promise<void>
  authenticate: (session: SessionResponse) => void
  isChangePasswordOpen: boolean
  setChangePasswordOpen: (open: boolean) => void
}>

const AuthContext = createContext<AuthContextState | null>(null)

const sessionToAuth = (session: SessionResponse): AuthData => ({
  userId: session.user.id,
  user: session.user.displayName,
  email: session.user.email,
})

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false)
  const queryClient = useQueryClient()
  const session = useQuery({
    queryKey: ['session'],
    queryFn: validateUserToken,
    retry: false,
    enabled: !isAuthRoute(window.location.pathname),
  })
  const currentUser = session.data ? sessionToAuth(session.data) : null
  const auth = useMemo<Auth>(
    () => ({ data: currentUser, isAuthenticated: Boolean(currentUser) }),
    [currentUser],
  )
  const authenticate = useCallback(
    (data: SessionResponse) => queryClient.setQueryData(['session'], data),
    [queryClient],
  )
  const logout = useCallback(
    async (saveRedirect = false) => {
      await logoutUser().catch(() => undefined)
      queryClient.clear()
      const path = window.location.pathname
      if (!isAuthRoute(path)) {
        const target = saveRedirect ? `/login?redirect=${encodeURIComponent(path)}` : '/login'
        window.location.replace(target)
      }
    },
    [queryClient],
  )

  useEffect(() => {
    return registerSessionExpiredHandler(logout)
  }, [logout])

  const value = useMemo(
    () => ({
      auth,
      isLoading: session.isLoading,
      logout,
      authenticate,
      isChangePasswordOpen,
      setChangePasswordOpen,
    }),
    [auth, authenticate, isChangePasswordOpen, logout, session.isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}
