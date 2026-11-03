import { Toggle, ToggleGroup } from '@/components/ui/toggle-group'
import { Tooltip, TooltipPanel, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { LayoutGrid, List } from 'lucide-react'
import { memo } from 'react'

export type ViewMode = 'grid' | 'list'

export const ViewModeToggle = memo(
  ({
    value,
    onValueChange,
    className,
  }: Readonly<{
    value: ViewMode
    onValueChange: (value: ViewMode) => void
    className?: string
  }>) => (
    <ToggleGroup
      value={value}
      onValueChange={onValueChange}
      size="sm"
      className={cn('h-8 p-0.5', className)}
    >
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
    </ToggleGroup>
  ),
)

ViewModeToggle.displayName = 'ViewModeToggle'
