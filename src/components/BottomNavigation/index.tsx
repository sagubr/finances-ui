import { cn } from '@/lib/utils'
import { Link, useLocation } from '@tanstack/react-router'
import { Ellipsis, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { BOTTOM_MORE_LINKS, BOTTOM_PRIMARY_ITEMS, type NavItem } from '../AppSidebar/constants'

const routeIsActive = (pathname: string, url: string) =>
  pathname === url || (url !== '/home' && pathname.startsWith(`${url}/`))

const itemIsActive = (pathname: string, item: NavItem): boolean =>
  Boolean(item.url && routeIsActive(pathname, item.url)) ||
  (item.items ?? []).some((child) => itemIsActive(pathname, child))

export const BottomNavigation = () => {
  const { pathname } = useLocation()
  const menuId = useId()
  const [moreOpen, setMoreOpen] = useState(false)
  const additionalRouteActive = BOTTOM_MORE_LINKS.some((item) => itemIsActive(pathname, item))

  useEffect(() => {
    if (!moreOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [moreOpen])

  return (
    <>
      {moreOpen && (
        <button
          type="button"
          aria-label="Fechar menu de recursos"
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      <nav
        aria-label="Navegação principal mobile"
        className="pointer-events-auto fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-lg md:hidden"
      >
        <div
          id={menuId}
          role="menu"
          aria-label="Mais recursos"
          aria-hidden={!moreOpen}
          className={cn(
            'absolute right-0 bottom-[calc(100%+0.75rem)] flex max-h-[calc(100dvh-8rem)] [scrollbar-width:none] flex-col items-end gap-2 overflow-y-auto py-1 transition-all duration-200 [&::-webkit-scrollbar]:hidden',
            moreOpen
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-3 opacity-0',
          )}
        >
          {BOTTOM_MORE_LINKS.map((item) => {
            if (!item.url) return null
            const active = itemIsActive(pathname, item)
            const Icon = item.icon

            return (
              <Link
                key={item.id}
                to={item.url}
                role="menuitem"
                tabIndex={moreOpen ? 0 : -1}
                aria-current={active ? 'page' : undefined}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  'border-border bg-background/95 text-foreground hover:bg-muted focus-visible:ring-ring/50 flex min-h-12 items-center gap-3 rounded-full border py-2.5 pr-4 pl-3 text-sm font-semibold whitespace-nowrap shadow-lg backdrop-blur-xl transition-[transform,background-color,color] hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:outline-none',
                  active && 'border-primary/30 bg-primary text-primary-foreground',
                )}
              >
                <span
                  className={cn(
                    'bg-muted flex size-8 items-center justify-center rounded-full',
                    active && 'bg-primary-foreground/15',
                  )}
                >
                  {Icon && <Icon className="size-5" />}
                </span>
                {item.title}
              </Link>
            )
          })}
        </div>

        <ul className="border-border bg-background/92 grid grid-cols-3 gap-1 rounded-[1.5rem] border p-1.5 shadow-[0_20px_55px_-18px_rgb(0_0_0/0.5)] backdrop-blur-xl">
          {BOTTOM_PRIMARY_ITEMS.map((item) => {
            if (!item.url) return null
            const active = itemIsActive(pathname, item)
            const Icon = item.icon

            return (
              <li key={item.id} className="min-w-0">
                <Link
                  to={item.url}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 flex min-h-[4.25rem] w-full min-w-0 flex-col items-center justify-center gap-1 rounded-[1.15rem] px-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-3',
                    active && 'bg-primary/12 text-primary',
                  )}
                >
                  {Icon && <Icon className="size-6 shrink-0" />}
                  <span className="max-w-full truncate">{item.title}</span>
                </Link>
              </li>
            )
          })}

          <li className="min-w-0">
            <button
              type="button"
              aria-label={moreOpen ? 'Fechar mais recursos' : 'Abrir mais recursos'}
              aria-current={additionalRouteActive ? 'page' : undefined}
              aria-haspopup="menu"
              aria-controls={menuId}
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((open) => !open)}
              className={cn(
                'text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 flex min-h-[4.25rem] w-full min-w-0 flex-col items-center justify-center gap-1 rounded-[1.15rem] px-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-3',
                (additionalRouteActive || moreOpen) && 'bg-primary/12 text-primary',
              )}
            >
              {moreOpen ? <X className="size-6" /> : <Ellipsis className="size-6" />}
              <span>Mais</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
