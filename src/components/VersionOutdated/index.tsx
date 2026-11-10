import { FullPageState } from '@/components/FullPageState'
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
    <FullPageState
      icon={Sparkles}
      eyebrow="Atualização disponível"
      title={title}
      description={description}
      actions={
        <>
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
        </>
      }
    />
  )
}

export default VersionOutdated
