import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react'

export const RootError = ({
  error,
  onRetry,
}: Readonly<{ error: unknown; onRetry: () => void }>) => (
  <main className="bg-background flex min-h-screen items-center justify-center p-6 text-center">
    <div className="flex max-w-md flex-col items-center gap-5">
      <div className="border-destructive/20 bg-destructive/10 text-destructive flex size-16 items-center justify-center rounded-2xl border">
        <AlertTriangle className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold">Não foi possível abrir esta página</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Ocorreu uma falha inesperada. Tente novamente ou recarregue a aplicação.
        </p>
      </div>
      {import.meta.env.DEV && error instanceof Error && (
        <pre className="bg-muted w-full overflow-auto rounded-lg p-3 text-left text-xs whitespace-pre-wrap">
          {error.message}
        </pre>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" variant="outline" onClick={onRetry}>
          <RotateCcw className="size-4" /> Tentar novamente
        </Button>
        <Button type="button" onClick={() => window.location.reload()}>
          <RefreshCw className="size-4" /> Recarregar aplicação
        </Button>
      </div>
    </div>
  </main>
)
