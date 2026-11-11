import { Button } from '@/components/ui/button'
import {
  clearPwaInstallPrompt,
  getPwaInstallPrompt,
  subscribeToPwaInstallPrompt,
  type PwaInstallPromptEvent,
} from '@/lib/pwa'
import { Download, Smartphone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const DISMISSED_AT_KEY = 'nummo-pwa-install-dismissed-at'
const DISMISSAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000
const OPEN_DELAY_MS = 1_500

const safeLocalStorage = (): Storage | null => {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const isStandalone = () => {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  )
}

const wasRecentlyDismissed = () => {
  const storage = safeLocalStorage()
  if (!storage) return false
  const dismissedAt = Number(storage.getItem(DISMISSED_AT_KEY) ?? 0)
  return dismissedAt > 0 && Date.now() - dismissedAt < DISMISSAL_DURATION_MS
}

const rememberDismissal = () => {
  try {
    safeLocalStorage()?.setItem(DISMISSED_AT_KEY, String(Date.now()))
  } catch {
    // The invitation can still be closed when storage is unavailable.
  }
}

export function PwaInstallPrompt() {
  const [prompt, setPrompt] = useState<PwaInstallPromptEvent | null>(() => getPwaInstallPrompt())
  const [open, setOpen] = useState(false)

  useEffect(() => subscribeToPwaInstallPrompt(setPrompt), [])

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed() || !prompt) return
    const timeout = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [prompt])

  useEffect(() => {
    const installed = () => {
      setOpen(false)
      toast.success('Nummo instalado!', {
        description: 'Agora você pode abrir o aplicativo direto pela tela inicial.',
      })
    }
    window.addEventListener('appinstalled', installed)
    return () => window.removeEventListener('appinstalled', installed)
  }, [])

  const dismiss = () => {
    rememberDismissal()
    setOpen(false)
  }

  const install = async () => {
    if (!prompt) return
    try {
      await prompt.prompt()
      const choice = await prompt.userChoice
      clearPwaInstallPrompt()
      setPrompt(null)
      setOpen(false)
      if (choice.outcome === 'dismissed') rememberDismissal()
    } catch {
      toast.error('Não foi possível abrir a instalação.', {
        description: 'Tente novamente em alguns instantes.',
      })
    }
  }

  if (!open || !prompt) return null

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
      className="bg-card text-card-foreground animate-in fade-in slide-in-from-bottom-4 fixed right-4 bottom-4 left-4 z-50 rounded-2xl border p-4 shadow-2xl duration-300 sm:left-auto sm:w-[22rem]"
    >
      <div className="flex items-start gap-3 pr-7">
        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
          <Smartphone className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="pwa-install-title" className="text-sm font-semibold">
            Deseja instalar esse app?
          </h2>
          <p id="pwa-install-description" className="text-muted-foreground mt-0.5 text-xs">
            Instale o Nummo para acessar suas finanças direto pela tela inicial, como qualquer outro aplicativo.
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="text-muted-foreground absolute top-3 right-3"
        onClick={dismiss}
        aria-label="Fechar convite de instalação"
      >
        <X className="size-3.5" />
      </Button>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
          Agora não
        </Button>
        <Button type="button" size="sm" className="min-w-28" onClick={() => void install()}>
          <Download className="size-3.5" />
          Instalar
        </Button>
      </div>
    </aside>
  )
}
