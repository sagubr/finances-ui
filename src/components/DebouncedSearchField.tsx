import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { Search } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'

interface DebouncedSearchFieldProps {
  readonly value: string
  readonly onValueChange: (value: string) => void
  readonly placeholder: string
  readonly delay?: number
  readonly inputClassName?: string
  readonly containerClassName?: string
}

export const DebouncedSearchField = memo(function DebouncedSearchField({
  value,
  onValueChange,
  placeholder,
  delay = 300,
  inputClassName,
  containerClassName = 'relative min-w-0 flex-1',
}: DebouncedSearchFieldProps) {
  const [draft, setDraft] = useState(value)
  const deferredDraft = useDebouncedValue(draft, delay)
  const lastEmittedValue = useRef(value)
  const suppressNextDeferredEmission = useRef(false)
  const onValueChangeRef = useRef(onValueChange)
  onValueChangeRef.current = onValueChange

  useEffect(() => {
    if (value !== lastEmittedValue.current) {
      suppressNextDeferredEmission.current = true
      setDraft(value)
    }
    lastEmittedValue.current = value
  }, [value])
  useEffect(() => {
    if (suppressNextDeferredEmission.current) {
      suppressNextDeferredEmission.current = false
      return
    }
    if (deferredDraft !== value) {
      lastEmittedValue.current = deferredDraft
      onValueChangeRef.current(deferredDraft)
    }
  }, [deferredDraft, value])

  return (
    <div className={containerClassName}>
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        className={inputClassName ?? 'pl-9'}
      />
    </div>
  )
})
