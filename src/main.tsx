import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { initializeErrorCatalog } from './api/error-catalog.api'
import GlobalErrorBoundary from './components/GlobalErrorBoundary'
import { PwaInstallPrompt } from './components/PwaInstallPrompt'
import { Toaster } from './components/ui/sonner'
import AuthProvider, { useAuth, type Auth } from './contexts/AuthProvider'
import { ThemeProvider } from './contexts/ThemeProvider'
import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider'
import { initializePwa } from './lib/pwa'
import { routeTree } from './routeTree.gen'
import './styles.css'

const queryContext = TanStackQueryProvider.getContext()
void initializeErrorCatalog()
void initializePwa()
const router = createRouter({
  routeTree,
  context: {
    ...queryContext,
    auth: null as Auth | null,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const { auth } = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

const rootElement = document.getElementById('root')
if (rootElement && !rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <GlobalErrorBoundary>
        <TanStackQueryProvider.Provider {...queryContext}>
          <ThemeProvider defaultTheme="system" storageKey="finances-theme">
            <AuthProvider>
              <InnerApp />
              <PwaInstallPrompt />
              <Toaster richColors />
            </AuthProvider>
          </ThemeProvider>
        </TanStackQueryProvider.Provider>
      </GlobalErrorBoundary>
    </StrictMode>,
  )
}
