import { FullPageState } from '@/components/FullPageState'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react'

export const RootError = ({
  error,
  onRetry,
}: Readonly<{ error: unknown; onRetry: () => void }>) => (
  <FullPageState
    icon={AlertTriangle}
    eyebrow="Falha ao carregar"
    title="Não foi possível abrir esta página"
    description="Ocorreu uma falha inesperada. Tente novamente ou recarregue a aplicação."
    tone="destructive"
    role="alert"
    detail={
      import.meta.env.DEV && error instanceof Error ? (
        <pre className="bg-muted w-full overflow-auto rounded-lg p-3 text-left text-xs whitespace-pre-wrap">
          {error.message}
        </pre>
      ) : undefined
    }
    actions={
      <>
        <Button type="button" variant="outline" onClick={onRetry}>
          <RotateCcw className="size-4" /> Tentar novamente
        </Button>
        <Button type="button" onClick={() => window.location.reload()}>
          <RefreshCw className="size-4" /> Recarregar aplicação
        </Button>
      </>
    }
  />
)
