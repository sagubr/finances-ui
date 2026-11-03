import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { TooltipButton } from './TooltipButton'
import { ManagementBarContainer } from './ui/management-bar'
import { ViewModeToggle, type ViewMode } from './ViewModeToggle'

export const ResourceViewToolbar = ({
  count,
  label,
  viewMode,
  onViewModeChange,
  onCreate,
  createLabel,
  createDisabled = false,
  actions,
}: Readonly<{
  count: number
  label: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onCreate?: () => void
  createLabel?: string
  createDisabled?: boolean
  actions?: ReactNode
}>) => (
  <div className="flex items-center justify-between gap-3">
    <p className="text-muted-foreground text-xs">
      {count} {label}
    </p>
    <ManagementBarContainer className="shadow-sm">
      <ViewModeToggle value={viewMode} onValueChange={onViewModeChange} />
      {actions}
      {onCreate && createLabel && (
        <TooltipButton
          title={createLabel}
          size="icon"
          className="size-8 shrink-0"
          disabled={createDisabled}
          onClick={onCreate}
        >
          <Plus className="size-4" />
        </TooltipButton>
      )}
    </ManagementBarContainer>
  </div>
)
