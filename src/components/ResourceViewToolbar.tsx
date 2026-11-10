import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { TooltipButton } from './TooltipButton'
import { ManagementBarContainer } from './ui/management-bar'
import { ViewModeToggle, type ViewMode } from './ViewModeToggle'

export const ResourceViewToolbar = ({
  count,
  label,
  singularLabel,
  viewMode,
  onViewModeChange,
  onCreate,
  createLabel,
  createDisabled = false,
  actions,
  leading,
}: Readonly<{
  count: number
  label: string
  singularLabel?: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onCreate?: () => void
  createLabel?: string
  createDisabled?: boolean
  actions?: ReactNode
  leading?: ReactNode
}>) => {
  const countLabel = (
    <p className="text-muted-foreground shrink-0 text-xs">
      {count} {count === 1 && singularLabel ? singularLabel : label}
    </p>
  )
  const managementBar = (
    <ManagementBarContainer className="shadow-sm">
      <ViewModeToggle
        value={viewMode}
        onValueChange={(mode) => mode !== 'map' && onViewModeChange(mode)}
      />
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
  )

  if (leading) {
    return (
      <div className="space-y-1">
        {countLabel}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">{leading}</div>
          {managementBar}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3">
      {countLabel}
      {managementBar}
    </div>
  )
}
