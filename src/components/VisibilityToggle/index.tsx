import { Tooltip, TooltipPanel, TooltipTrigger } from '@/components/ui/tooltip'
import { AlignHorizontalSpaceAround, LucideGalleryHorizontal } from 'lucide-react'
import React, { useCallback } from 'react'
import { useVisibility } from '../../contexts/VisibilityProvider'
import { Button } from '../ui/button'

export const VisibilityToggle: React.FC = React.memo(() => {
  const { setVisibility, visibility } = useVisibility()

  const handleToggle = useCallback(() => {
    const nextState = visibility === 'collapsed' ? 'full' : 'collapsed'
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        setVisibility(nextState)
      })
      return
    }
    setVisibility(nextState)
  }, [setVisibility, visibility])

  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={handleToggle} />}>
        {visibility === 'collapsed' ? <AlignHorizontalSpaceAround /> : <LucideGalleryHorizontal />}
      </TooltipTrigger>
      <TooltipPanel>
        Alternar visibilidade (atual: {visibility === 'collapsed' ? 'recolhida' : 'expandida'})
      </TooltipPanel>
    </Tooltip>
  )
})
VisibilityToggle.displayName = 'VisibilityToggle'

export default VisibilityToggle
