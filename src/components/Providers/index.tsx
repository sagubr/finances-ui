import { ThemeProvider } from '../../contexts/ThemeProvider'
import ChangePasswordDialog from '../ChangePasswordDialog'
import { SidebarProvider } from '../ui/sidebar'
import { Toaster } from '../ui/sonner'

type ProvidersProps = {
  children: React.ReactNode
}

const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider>
      <SidebarProvider className="h-svh overflow-hidden">
        {children}
        <ChangePasswordDialog />
      </SidebarProvider>
      <Toaster richColors />
    </ThemeProvider>
  )
}

export default Providers
