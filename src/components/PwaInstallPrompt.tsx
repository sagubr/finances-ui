import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  clearPwaInstallPrompt,
  getPwaInstallPrompt,
  subscribeToPwaInstallPrompt,
  type PwaInstallPromptEvent,
} from '@/lib/pwa'
import { Check, Download, Smartphone } from 'lucide-react'
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

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) dismiss()
      }}
    >
      <DialogContent className="max-w-md gap-5" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <div className="bg-primary/10 mb-1 flex size-16 items-center justify-center rounded-2xl">
            <img src="/icon-192.png" alt="" className="size-12 rounded-xl" />
          </div>
          <DialogTitle className="text-xl">Deseja instalar esse app?</DialogTitle>
          <DialogDescription className="max-w-sm">
            Instale o Nummo para acessar suas finanças direto pela tela inicial, como qualquer outro
            aplicativo.
          </DialogDescription>
        </DialogHeader>

        <ul className="grid gap-3 text-sm">
          <li className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
              <Smartphone className="size-4" />
            </span>
            Acesso rápido pela tela inicial
          </li>
          <li className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
              <Check className="size-4" />
            </span>
            Experiência em tela cheia, sem procurar no navegador
          </li>
        </ul>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={dismiss}>
            Agora não
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={() => void install()}>
            <Download className="size-4" />
            Instalar aplicativo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
