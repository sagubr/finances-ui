import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useEffect, useRef } from 'react'

interface InfiniteScrollTriggerProps {
  readonly hasNextPage: boolean
  readonly isFetchingNextPage: boolean
  readonly onLoadMore: () => void
  readonly autoLoad?: boolean
}

export function InfiniteScrollTrigger({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  autoLoad = true,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = triggerRef.current
    if (!autoLoad || !element || !hasNextPage || isFetchingNextPage) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onLoadMore()
      },
      { rootMargin: '320px 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [autoLoad, hasNextPage, isFetchingNextPage, onLoadMore])

  if (!hasNextPage) return null
  return (
    <div ref={triggerRef} className="flex min-h-12 items-center justify-center py-3">
      <Button variant="ghost" size="sm" disabled={isFetchingNextPage} onClick={onLoadMore}>
        {isFetchingNextPage && <Spinner />}
        {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
      </Button>
    </div>
  )
}
