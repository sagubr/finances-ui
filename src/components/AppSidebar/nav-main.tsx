import { Link, useMatchRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import type { NavItem } from './constants'

type NavMainProps = {
  items: NavItem[]
  label?: string
}

export function NavMain({ items, label }: NavMainProps) {
  const matchRoute = useMatchRoute()

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const subItems = item.items ?? []
          const hasSubItems = subItems.length > 0

          if (hasSubItems) {
            const isAnySubItemActive = subItems.some(
              (subItem) => subItem.url && !!matchRoute({ to: subItem.url, fuzzy: true }),
            )

            return (
              <Collapsible
                key={item.title}
                defaultOpen={isAnySubItemActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} />}>
                    {item.icon && <item.icon />}
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <span className="bg-primary/10 text-primary border-primary/20 ml-auto shrink-0 rounded border px-1.5 py-0.5 text-[9px] leading-none font-semibold tracking-wider uppercase">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      className={`size-4 shrink-0 transition-transform duration-300 ease-in-out group-data-open/collapsible:rotate-90 ${item.badge ? 'ml-1' : 'ml-auto'}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {subItems.map((subItem) => {
                        const subContent = (
                          <span className="flex w-full items-center justify-between gap-1.5">
                            <span className="flex items-center gap-2 truncate">
                              {subItem.icon && (
                                <subItem.icon className="size-3.5 shrink-0 opacity-70" />
                              )}
                              <span className="truncate">{subItem.title}</span>
                            </span>
                            {subItem.badge && (
                              <span className="bg-primary/10 text-primary shrink-0 origin-right scale-90 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase">
                                {subItem.badge}
                              </span>
                            )}
                          </span>
                        )

                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            {subItem.url ? (
                              <SidebarMenuSubButton
                                asChild
                                isActive={!!matchRoute({ to: subItem.url })}
                              >
                                <Link to={subItem.url}>{subContent}</Link>
                              </SidebarMenuSubButton>
                            ) : (
                              <SidebarMenuSubButton
                                className="cursor-not-allowed opacity-60 hover:bg-transparent active:bg-transparent"
                                aria-disabled="true"
                              >
                                {subContent}
                              </SidebarMenuSubButton>
                            )}
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          const content = (
            <>
              {item.icon && <item.icon />}
              <span className="flex-grow text-left">{item.title}</span>
              {item.badge && (
                <span className="bg-primary/10 text-primary ml-auto shrink-0 origin-right scale-90 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase">
                  {item.badge}
                </span>
              )}
            </>
          )

          return (
            <SidebarMenuItem key={item.title}>
              {item.url ? (
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={!!matchRoute({ to: item.url })}
                >
                  <Link to={item.url}>{content}</Link>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  tooltip={item.title}
                  className="cursor-not-allowed opacity-70 hover:bg-transparent active:bg-transparent"
                  disabled
                >
                  {content}
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
