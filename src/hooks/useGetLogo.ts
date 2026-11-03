import { useTheme } from '@/contexts/ThemeProvider'
import { useSyncExternalStore } from 'react'

type LogoVariant = 'logo' | 'icon'

export const useGetLogo = (variant: LogoVariant = 'logo') => {
  const { theme } = useTheme()
  const prefersDark = useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', onStoreChange)
      return () => mediaQuery.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    () => false,
  )
  const actualTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme

  const logoMap: Record<LogoVariant, Record<'light' | 'dark', string>> = {
    icon: {
      dark: '/favicon.svg',
      light: '/favicon.svg',
    },
    logo: {
      dark: '/logo-dark.svg',
      light: '/logo-light.svg',
    },
  }

  return logoMap[variant][actualTheme]
}

export default useGetLogo
