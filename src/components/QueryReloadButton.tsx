import { TooltipButton } from '@/components/TooltipButton'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useCallback, useState } from 'react'

export const QueryReloadButton = () => {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await queryClient.invalidateQueries({ refetchType: 'active' })
    } finally {
      setIsRefreshing(false)
    }
  }, [queryClient])

  return (
    <TooltipButton
      title="Atualizar dados"
      variant="outline"
      size="icon"
      className="size-8 shrink-0 rounded-full"
      disabled={isRefreshing}
      onClick={() => void refresh()}
    >
      <RefreshCw className={isRefreshing ? 'animate-spin' : undefined} />
    </TooltipButton>
  )
}
