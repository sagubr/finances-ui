import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { NAV_GROUPS } from './constants'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { WorkspaceSwitcher } from './workspace-switcher'

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" className={cn('hidden md:flex', className)} {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <NavMain key={group.id} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
export default AppSidebar
