import { Button } from '@/components/ui/button'
import { Tooltip, TooltipPanel, TooltipTrigger } from '@/components/ui/tooltip'
import { Plus, RefreshCw } from 'lucide-react'
import { memo } from 'react'

interface ResourcePageActionsProps {
  readonly isRefreshing: boolean
  readonly refreshLabel: string
  readonly onRefresh: () => void
  readonly onCreate?: () => void
  readonly createLabel?: string
}

export const ResourcePageActions = memo(
  ({
    isRefreshing,
    refreshLabel,
    onRefresh,
    onCreate,
    createLabel = 'Criar novo recurso',
  }: ResourcePageActionsProps) => (
    <div className="flex h-8 items-center gap-2">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0"
              disabled={isRefreshing}
              onClick={onRefresh}
              aria-label={refreshLabel}
            />
          }
        >
          <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </TooltipTrigger>
        <TooltipPanel>{refreshLabel}</TooltipPanel>
      </Tooltip>

      {onCreate && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                size="icon"
                className="size-8 shrink-0"
                onClick={onCreate}
                aria-label={createLabel}
              />
            }
          >
            <Plus className="size-4" />
          </TooltipTrigger>
          <TooltipPanel>{createLabel}</TooltipPanel>
        </Tooltip>
      )}
    </div>
  ),
)

ResourcePageActions.displayName = 'ResourcePageActions'

interface EmptyCreateActionProps {
  readonly onCreate: () => void
  readonly label: string
}

export const EmptyCreateAction = ({ onCreate, label }: EmptyCreateActionProps) => (
  <Button
    type="button"
    size="sm"
    variant="outline"
    onClick={onCreate}
    className="border-primary/30 bg-primary/[0.03] text-foreground/75 hover:border-primary/50 hover:bg-primary/[0.07] hover:text-foreground h-9 gap-2 border-dashed px-4 shadow-none"
  >
    <Plus className="size-3.5" />
    {label}
  </Button>
)
