import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'

interface VersionOutdatedProps {
  readonly title?: string
  readonly description?: string
}

const VersionOutdated = ({
  title = 'Nova versão disponível',
  description = 'Uma nova versão do sistema foi publicada no servidor. Atualize a página para carregar os recursos e componentes mais recentes.',
}: VersionOutdatedProps = {}) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
        window.location.reload()
        return
      }
    } catch {
      // Ignora erro de acesso a cache
    }
    window.location.reload()
  }

  return (
    <div className="bg-background fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center p-6 text-center select-none">
      <div className="flex max-w-md flex-col items-center gap-5">
        <div className="border-primary/20 bg-primary/10 text-primary flex size-20 items-center justify-center rounded-2xl border shadow-sm">
          <Sparkles className="size-10" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-primary text-5xl font-extrabold tracking-tight">Atualização</h1>
          <p className="text-foreground text-lg font-semibold tracking-wider uppercase">{title}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isUpdating}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Página anterior
          </Button>
          <Button onClick={() => void handleUpdate()} disabled={isUpdating} className="gap-2">
            <RefreshCw className={`size-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Atualizando...' : 'Atualizar agora'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VersionOutdated
