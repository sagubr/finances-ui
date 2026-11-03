import { extractErrorMessage } from '@/api/utils'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import { CircleAlert, RefreshCw } from 'lucide-react'

interface ResourceErrorStateProps {
  readonly title: string
  readonly error: unknown
  readonly fallbackMessage: string
  readonly onRetry: () => void
  readonly isRetrying?: boolean
  readonly compact?: boolean
}

export const ResourceErrorState = ({
  title,
  error,
  fallbackMessage,
  onRetry,
  isRetrying = false,
  compact = false,
}: ResourceErrorStateProps) => (
  <div className={cn('mx-auto flex w-full max-w-4xl', compact ? 'py-4' : 'py-12')}>
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleAlert className="text-destructive size-5" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{extractErrorMessage(error, fallbackMessage)}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
          <RefreshCw className={cn('size-3.5', isRetrying && 'animate-spin')} />
          Tentar novamente
        </Button>
      </EmptyContent>
    </Empty>
  </div>
)
