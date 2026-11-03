import { extractErrorMessage } from '@/api/utils'
import StatusIndicator from '@/components/ui/status-indicator'

type ComponentLoaderProps = {
  isLoading: boolean
  error: Error | null
  fallback?: React.ReactNode
  defaultErrorMessage?: string
  children: React.ReactNode
}

const ComponentLoader = ({
  children,
  error,
  isLoading,
  fallback,
  defaultErrorMessage,
}: ComponentLoaderProps) => {
  if (isLoading) {
    return fallback || null
  }

  if (error) {
    const errorMessage = extractErrorMessage(error, defaultErrorMessage || 'Erro ao buscar dados')

    return (
      <div className="flex justify-center">
        <StatusIndicator variant="error" message={errorMessage} />
      </div>
    )
  }

  return children
}

export default ComponentLoader
