import { Toggle, ToggleGroup } from '@/components/ui/toggle-group'
import { Tooltip, TooltipPanel, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/useMobile'
import { cn } from '@/lib/utils'
import { LayoutGrid, List, Map } from 'lucide-react'
import { memo } from 'react'

export type ViewMode = 'grid' | 'list'
export type TransactionViewMode = ViewMode | 'map'

export const ViewModeToggle = memo(
  ({
    value,
    onValueChange,
    className,
    allowMap = false,
  }: Readonly<{
    value: TransactionViewMode
    onValueChange: (value: TransactionViewMode) => void
    className?: string
    allowMap?: boolean
  }>) => {
    const isMobile = useIsMobile()

    return (
      <ToggleGroup
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue === 'list' || nextValue === 'grid' || nextValue === 'map')
            onValueChange(nextValue)
        }}
        size="sm"
        className={cn('h-8 p-0.5', className)}
      >
        {!isMobile && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle value="list" aria-label="Visualização em tabela">
                  <List className="size-4" />
                </Toggle>
              }
            />
            <TooltipPanel>Visualização em tabela</TooltipPanel>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle value="grid" aria-label="Visualização em cartões">
                <LayoutGrid className="size-4" />
              </Toggle>
            }
          />
          <TooltipPanel>Visualização em cartões</TooltipPanel>
        </Tooltip>
        {allowMap && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Toggle value="map" aria-label="Visualização no mapa">
                  <Map className="size-4" />
                </Toggle>
              }
            />
            <TooltipPanel>Visualização no mapa</TooltipPanel>
          </Tooltip>
        )}
      </ToggleGroup>
    )
  },
)

ViewModeToggle.displayName = 'ViewModeToggle'
