import AppHeader from '@/components/AppHeader'
import AppSidebar from '@/components/AppSidebar'
import { BottomNavigation } from '@/components/BottomNavigation'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import RequireAuth from '@/middlewares/RequireAuth'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_app')({
  validateSearch: z.object({ source: z.string().optional() }),
  component: AppLayout,
})

function AppLayout() {
  return (
    <RequireAuth>
      <SidebarProvider className="h-svh overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex h-full max-w-full min-w-0 flex-col overflow-hidden">
          <AppHeader />
          <main className="max-w-full min-w-0 flex-1 overflow-auto p-4 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:p-5 md:p-6">
            <div className="flex min-h-0 w-full max-w-full min-w-0 flex-1 flex-col">
              <Outlet />
            </div>
          </main>
          <BottomNavigation />
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  )
}
