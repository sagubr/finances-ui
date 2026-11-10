import { getBreadcrumbLabel } from '@/config/breadcrumbs.dictionary'
import { CompetencePicker } from '@/modules/competence/components/CompetencePicker'
import { Link, useLocation, useRouterState } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'
import React from 'react'
import { WorkspaceSwitcher } from '../AppSidebar/workspace-switcher'
import { ModeToggle } from '../ModeToggle'
import { QueryReloadButton } from '../QueryReloadButton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb'
import { Separator } from '../ui/separator'
import { SidebarTrigger } from '../ui/sidebar'

const redirectMap: Record<string, string> = { settings: '/settings' }

export const AppHeader: React.FC = React.memo(() => {
  const { isLoading } = useRouterState()
  const location = useLocation()

  const breadcrumbItems = React.useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const isHome =
      pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === 'home')

    const homeLabel = getBreadcrumbLabel('home')

    if (isHome) {
      return [
        {
          label: homeLabel,
          url: '/home',
          isLast: true,
        },
      ]
    }

    const segmentItems = pathSegments.reduce<
      Array<{ label: string; url: string; isLast: boolean }>
    >((acc, segment, index) => {
      if (segment === 'preview' && pathSegments[1] === 'integrations') return acc

      const currentPath = `/${pathSegments.slice(0, index + 1).join('/')}`
      const isLast =
        index === pathSegments.length - 1 ||
        (pathSegments[1] === 'integrations' &&
          segment !== 'preview' &&
          index === pathSegments.length - 2)

      const isFormBuilderChild = index > 0 && pathSegments[index - 1] === 'form-builder'
      const label = isFormBuilderChild ? 'Editar Modelo' : getBreadcrumbLabel(segment)

      const url = redirectMap[segment] || currentPath

      return [...acc, { label, url, isLast }]
    }, [])

    return [
      {
        label: homeLabel,
        url: '/home',
        isLast: false,
      },
      ...segmentItems,
    ]
  }, [location.pathname])

  return (
    <div className="border-border bg-background sticky top-0 z-40 w-full border-b">
      <div className="flex w-full items-center gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="hidden md:inline-flex" />
          <Separator
            orientation="vertical"
            className="my-auto hidden data-[orientation=vertical]:h-5 md:block"
          />
          <div className="min-w-0 md:hidden">
            <WorkspaceSwitcher compact />
          </div>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList className="text-foreground/70 flex items-center gap-1.5 text-sm">
              {breadcrumbItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <BreadcrumbSeparator className="text-foreground/70/40 flex items-center">
                      <ChevronRight className="size-3" />
                    </BreadcrumbSeparator>
                  )}
                  <BreadcrumbItem className="flex items-center">
                    {item.isLast ? (
                      <BreadcrumbPage className="text-foreground flex items-center gap-1 text-sm font-semibold">
                        {item.url === '/home' && <Home className="size-3.5" />}
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        render={<Link to={item.url} />}
                        className="text-foreground/70 hover:text-foreground flex items-center gap-1 text-sm transition-colors"
                      >
                        {item.url === '/home' && <Home className="size-3.5" />}
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="ml-auto flex h-full min-w-0 items-center gap-2 sm:gap-4">
          <CompetencePicker />
          <span className="hidden md:inline-flex">
            <QueryReloadButton />
          </span>
          <ModeToggle />
        </div>
        {isLoading && (
          <div className="bg-background/50 absolute inset-0 bottom-0 z-50 flex items-start">
            <div className="h-1 w-full">
              <div className="bg-primary h-full w-full animate-pulse rounded-full transition-all" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
AppHeader.displayName = 'AppHeader'

export default AppHeader
