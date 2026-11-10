import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
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
  containerClassName = 'min-w-0 flex-1',
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
    <InputGroup className={containerClassName}>
      <InputGroupAddon>
        <Search className="size-4" />
      </InputGroupAddon>
      <InputGroupInput
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />
    </InputGroup>
  )
})
