import { Link } from '@tanstack/react-router'
import { ArrowLeft, Home, Unlink } from 'lucide-react'
import { Button } from '../ui/button'

interface RootNotFoundProps {
  readonly title?: string
  readonly description?: string
}

const RootNotFound = ({
  title = 'Página não encontrada',
  description = 'O recurso ou link buscado não foi encontrado ou pode ter sido movido.',
}: RootNotFoundProps = {}) => {
  return (
    <div className="bg-background fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center p-6 text-center select-none">
      <div className="flex max-w-md flex-col items-center gap-5">
        <div className="border-primary/20 bg-primary/10 text-primary flex size-20 items-center justify-center rounded-2xl border shadow-sm">
          <Unlink className="size-10" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-primary text-6xl font-extrabold tracking-tight">404</h1>
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

export default RootNotFound
