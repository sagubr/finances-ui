import Forbidden from '@/components/Forbidden'
import RootNotFound from '@/components/RootNotFound'
import VersionOutdated from '@/components/VersionOutdated'
import { createRootRoute, Outlet } from '@tanstack/react-router'

const isChunkLoadError = (error: unknown): boolean => {
  if (!error) return false
  const msg = (
    typeof error === 'string' ? error : (error as { message?: string })?.message || ''
  ).toLowerCase()
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('failed to load module script') ||
    msg.includes('expected a javascript-or-wasm module script') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('loading chunk')
  )
}

export const Route = createRootRoute({
  component: Outlet,
  notFoundComponent: () => <RootNotFound />,
  errorComponent: ({ error }) => {
    if (isChunkLoadError(error)) {
      return <VersionOutdated />
    }

    const isForbidden = Boolean(
      error &&
      typeof error === 'object' &&
      (('status' in error && (error.status === 403 || error.status === 401)) ||
        ('statusCode' in error && (error.statusCode === 403 || error.statusCode === 401))),
    )

    if (isForbidden) {
      return <Forbidden />
    }

    return <RootNotFound />
  },
})
