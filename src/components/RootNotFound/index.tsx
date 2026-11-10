import { FullPageState } from '@/components/FullPageState'
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
    <FullPageState
      icon={Unlink}
      eyebrow="Erro 404"
      title={title}
      description={description}
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

export default RootNotFound
