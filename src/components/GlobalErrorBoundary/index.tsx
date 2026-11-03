import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '../ui/button'

interface GlobalErrorBoundaryProps {
  readonly children: ReactNode
  readonly fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode)
  readonly onCatch?: (error: Error, errorInfo: ErrorInfo) => void
}

interface GlobalErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  public override state: GlobalErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onCatch) {
      this.props.onCatch(error, errorInfo)
    } else if (import.meta.env.DEV) {
      console.error(
        '[GlobalErrorBoundary] Erro não capturado capturado pelo boundary:',
        error,
        errorInfo,
      )
    }
  }

  public reset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  public handleReload = (): void => {
    try {
      if ('caches' in window) {
        void caches
          .keys()
          .then((keys) => {
            void Promise.all(keys.map((key) => caches.delete(key))).finally(() => {
              window.location.reload()
            })
          })
          .catch(() => {
            window.location.reload()
          })
        return
      }
    } catch {
      // Ignora erro de acesso a cache
    }
    window.location.reload()
  }

  public override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({
          error: this.state.error ?? new Error('Erro desconhecido'),
          reset: this.reset,
        })
      }
      return this.props.fallback
    }

    const errorMessage = this.state.error?.message || 'Ocorreu uma falha inesperada na interface.'

    return (
      <div className="bg-background fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center p-6 text-center select-none">
        <div className="flex max-w-md flex-col items-center gap-5">
          <div className="border-destructive/20 bg-destructive/10 text-destructive flex size-20 items-center justify-center rounded-2xl border shadow-sm">
            <AlertTriangle className="size-10" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-destructive text-5xl font-extrabold tracking-tight">Ops!</h1>
            <p className="text-foreground text-lg font-semibold tracking-wider uppercase">
              Ocorreu um erro inesperado
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A aplicação encontrou uma falha ao renderizar este componente. Você pode tentar
              reiniciar o estado da interface ou recarregar a página.
            </p>
          </div>

          {import.meta.env.DEV && this.state.error?.message && (
            <div className="bg-muted/50 border-border/50 text-muted-foreground w-full max-w-sm rounded-lg border p-3 text-left font-mono text-xs break-words">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button variant="outline" onClick={this.reset} className="gap-2">
              <RotateCcw className="size-4" />
              Tentar novamente
            </Button>
            <Button onClick={this.handleReload} className="gap-2">
              <RefreshCw className="size-4" />
              Recarregar aplicação
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

export default GlobalErrorBoundary
