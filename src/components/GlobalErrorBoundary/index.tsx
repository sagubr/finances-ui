import { FullPageState } from '@/components/FullPageState'
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
      <FullPageState
        icon={AlertTriangle}
        eyebrow="Falha na interface"
        title="Ocorreu um erro inesperado"
        description="A aplicação encontrou uma falha ao exibir este conteúdo. Tente novamente ou recarregue a página."
        tone="destructive"
        role="alert"
        detail={
          import.meta.env.DEV && this.state.error?.message ? (
            <div className="bg-muted/50 border-border/50 text-muted-foreground w-full max-w-sm rounded-lg border p-3 text-left font-mono text-xs break-words">
              {errorMessage}
            </div>
          ) : undefined
        }
        actions={
          <>
            <Button variant="outline" onClick={this.reset} className="gap-2">
              <RotateCcw className="size-4" />
              Tentar novamente
            </Button>
            <Button onClick={this.handleReload} className="gap-2">
              <RefreshCw className="size-4" />
              Recarregar aplicação
            </Button>
          </>
        }
      />
    )
  }
}

export default GlobalErrorBoundary
