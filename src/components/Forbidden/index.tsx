import { FullPageState } from '@/components/FullPageState'
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
    <FullPageState
      icon={Lock}
      eyebrow="Erro 403"
      title={title}
      description={description}
      tone="destructive"
      role="alert"
      actions={
        <>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="size-4" />
            Página anterior
          </Button>
          <Button render={<Link to="/" />} nativeButton={false} className="gap-2">
            <Home className="size-4" />
            Voltar ao início
          </Button>
        </>
      }
    />
  )
}

export default Forbidden
