import { AnimatedBackground } from '@/components/ui/animated-background'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Link, useLocation } from '@tanstack/react-router'
import { Ellipsis } from 'lucide-react'
import { useState } from 'react'
import { BOTTOM_MORE_ITEMS, BOTTOM_PRIMARY_ITEMS, type NavItem } from '../AppSidebar/constants'

const routeIsActive = (pathname: string, url: string) =>
  pathname === url || (url !== '/home' && pathname.startsWith(`${url}/`))

const itemIsActive = (pathname: string, item: NavItem): boolean =>
  Boolean(item.url && routeIsActive(pathname, item.url)) ||
  (item.items ?? []).some((child) => itemIsActive(pathname, child))

export const BottomNavigation = () => {
  const { pathname } = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const additionalRouteActive = BOTTOM_MORE_ITEMS.some((item) => itemIsActive(pathname, item))
  const activeValue =
    BOTTOM_PRIMARY_ITEMS.find((item) => itemIsActive(pathname, item))?.url ??
    (additionalRouteActive ? 'more' : null)
  const highlightedValue = moreOpen ? 'more' : activeValue

  return (
    <>
      <nav
        aria-label="Navegação principal mobile"
        className="pointer-events-none fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 px-3 md:hidden"
      >
        <div className="border-border/70 bg-background/90 pointer-events-auto mx-auto grid max-w-sm grid-cols-5 gap-1 rounded-2xl border p-1.5 shadow-[0_18px_50px_-16px_rgb(0_0_0/0.55)] ring-1 ring-black/5 backdrop-blur-xl dark:ring-white/10">
          <AnimatedBackground
            defaultValue={highlightedValue ?? undefined}
            onValueChange={(value) => {
              if (value === 'more') setMoreOpen(true)
            }}
            className="bg-primary/10 rounded-xl"
            transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.7 }}
          >
            {BOTTOM_PRIMARY_ITEMS.map((item) => {
              if (!item.url) return null
              const active = itemIsActive(pathname, item)
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  data-id={item.url}
                  to={item.url}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'text-muted-foreground flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors',
                    active && 'text-primary',
                  )}
                >
                  <span className="flex min-w-0 flex-col items-center gap-1">
                    {Icon && <Icon className="size-5" />}
                    <span className="max-w-full truncate">{item.title}</span>
                  </span>
                </Link>
              )
            })}
            <button
              data-id="more"
              type="button"
              aria-current={additionalRouteActive ? 'page' : undefined}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen(true)}
              className={cn(
                'text-muted-foreground flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors',
                additionalRouteActive && 'text-primary',
              )}
            >
              <span className="flex flex-col items-center gap-1">
                <Ellipsis className="size-5" />
                <span>Mais</span>
              </span>
            </button>
          </AnimatedBackground>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
        >
          <SheetHeader className="border-b pr-12">
            <SheetTitle>Mais recursos</SheetTitle>
            <SheetDescription>Acesse os demais módulos da sua área financeira.</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2 px-4 pb-2">
            {BOTTOM_MORE_ITEMS.map((item) => {
              if (!item.url) return null
              const active = itemIsActive(pathname, item)
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'border-border bg-card text-muted-foreground flex min-w-0 flex-col items-center gap-2 rounded-xl border p-3 text-center text-xs font-medium transition-colors',
                    'hover:bg-muted hover:text-foreground',
                    active && 'border-primary/30 bg-primary/10 text-primary',
                  )}
                >
                  {Icon && <Icon className="size-5" />}
                  <span className="max-w-full truncate">{item.title}</span>
                </Link>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
