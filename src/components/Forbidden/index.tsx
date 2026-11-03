import { Link } from '@tanstack/react-router'
import { ArrowLeft, Home, Lock } from 'lucide-react'
import { Button } from '../ui/button'

interface ForbiddenProps {
  readonly title?: string
  readonly description?: string
}

const Forbidden = ({
  title = 'Acesso não autorizado',
  description = 'Você não possui permissão para acessar esta área ou recurso no espaço financeiro atual.',
}: ForbiddenProps) => {
  return (
    <div className="bg-background fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center p-6 text-center select-none">
      <div className="flex max-w-md flex-col items-center gap-5">
        <div className="border-destructive/20 bg-destructive/10 text-destructive flex size-20 items-center justify-center rounded-2xl border shadow-sm">
          <Lock className="size-10" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-destructive text-6xl font-extrabold tracking-tight">403</h1>
          <p className="text-foreground text-lg font-semibold tracking-wider uppercase">{title}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="size-4" />
            Página anterior
          </Button>
          <Button render={<Link to="/" />} nativeButton={false} className="gap-2">
            <Home className="size-4" />
            Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Forbidden
