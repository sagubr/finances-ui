import { Badge } from '@/components/ui/badge'
import { Lock, Users } from 'lucide-react'

interface ResourceVisibilityBadgeProps {
  isShared?: boolean
}

export const getResourceVisibilityLabel = (isShared?: boolean) =>
  isShared ? 'Compartilhado' : 'Privado'

export const getResourceVisibilityActionLabel = (isShared?: boolean) =>
  isShared ? 'Tornar privado' : 'Compartilhar'

export function ResourceVisibilityBadge({ isShared }: ResourceVisibilityBadgeProps) {
  if (isShared) {
    return (
      <Badge
        size="sm"
        variant="outline"
        className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
      >
        <Users className="size-2.5" /> {getResourceVisibilityLabel(true)}
      </Badge>
    )
  }

  return (
    <Badge size="sm" variant="outline" className="text-muted-foreground gap-1">
      <Lock className="size-2.5" /> {getResourceVisibilityLabel(false)}
    </Badge>
  )
}
