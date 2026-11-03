import ScreenSplash from '@/components/ScreenSplash'
import { useAuth } from '@/contexts/AuthProvider'
import { useWorkspaces } from '@/modules/workspaces/queries'
import Login from '@/routes/(auth)/-components/Login'

interface RequireAuthProps {
  children?: React.ReactNode
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isLoading: isAuthLoading, auth } = useAuth()
  const isAuthenticated = Boolean(auth?.isAuthenticated)
  const { isLoading: isWorkspacesLoading } = useWorkspaces(isAuthenticated)

  if (isAuthLoading)
    return (
      <div className="h-screen w-screen">
        <ScreenSplash />
      </div>
    )

  if (!isAuthenticated) return <Login />

  if (isWorkspacesLoading)
    return (
      <div className="h-screen w-screen">
        <ScreenSplash />
      </div>
    )

  return children
}

export default RequireAuth
