import { Monitor, Moon, Sun } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeProvider'

import { Tooltip, TooltipPanel, TooltipTrigger } from '@/components/ui/tooltip'

type ThemeSelection = 'system' | 'dark' | 'light'

const themeLabels: Record<ThemeSelection, string> = {
  system: 'Sistema',
  dark: 'Escuro',
  light: 'Claro',
}

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const effectiveTheme = theme as ThemeSelection
  const modes: ThemeSelection[] = ['system', 'dark', 'light']

  const getNextTheme = (current: ThemeSelection) => {
    const i = modes.indexOf(current)
    if (i === -1) return modes[0]
    return modes[(i + 1) % modes.length]
  }

  const handleToggle = (e: React.MouseEvent) => {
    const nextTheme = getNextTheme(effectiveTheme)

    if (!('startViewTransition' in document)) {
      setTheme(nextTheme)
      return
    }

    const x = e.clientX
    const y = e.clientY
    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme)
    })

    void transition.ready.then(() => {
      const isDark =
        nextTheme === 'dark' ||
        (nextTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
      document.documentElement.animate(
        {
          clipPath: isDark ? clipPath.reverse() : clipPath,
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: isDark ? '::view-transition-old(root)' : '::view-transition-new(root)',
        },
      )
    })
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggle}
            className="relative overflow-hidden"
          />
        }
      >
        <Sun
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
            effectiveTheme === 'light' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'
          }`}
        />
        <Moon
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
            effectiveTheme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
          }`}
        />
        <Monitor
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
            effectiveTheme === 'system' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'
          }`}
        />
        <span className="sr-only">Alternar tema</span>
      </TooltipTrigger>
      <TooltipPanel>Alterar tema (atual: {themeLabels[effectiveTheme]})</TooltipPanel>
    </Tooltip>
  )
}
