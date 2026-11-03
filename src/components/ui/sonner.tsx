import { useOptionalTheme } from '@/contexts/ThemeProvider'
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
} from '@remixicon/react'
import type React from 'react'
import type { ToasterProps } from 'sonner'
import { Toaster as Sonner } from 'sonner'
import { Spinner } from './spinner.tsx'

const Toaster = ({ position = 'top-center', ...props }: ToasterProps) => {
  const themeContext = useOptionalTheme()
  const theme = themeContext?.theme ?? 'system'

  return (
    <Sonner
      {...props}
      theme={theme as ToasterProps['theme']}
      className="toaster group font-sans"
      position={position}
      closeButton={false}
      duration={4000}
      visibleToasts={3}
      icons={{
        success: <RiCheckboxCircleLine className="size-4" />,
        info: <RiInformationLine className="size-4" />,
        warning: <RiErrorWarningLine className="size-4" />,
        error: <RiCloseCircleLine className="size-4" />,
        loading: <Spinner className="size-4" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl font-sans text-sm',
          description: 'group-[.toast]:text-muted-foreground group-[.toast]:text-xs',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:text-xs group-[.toast]:font-medium',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:text-xs group-[.toast]:font-medium',
        },
      }}
    />
  )
}

export { Toaster }
