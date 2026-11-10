import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { matchesSearchText } from '@/lib/search-text'
import { cn } from '@/lib/utils'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

const VIRTUALIZATION_THRESHOLD = 1000
const MOBILE_OPTION_ESTIMATED_HEIGHT = 44
const DESKTOP_OPTION_ESTIMATED_HEIGHT = 32

export interface SearchableSelectOption {
  readonly value: string
  readonly label: string
  readonly icon?: React.ReactNode
  readonly badge?: string
  readonly sublabel?: string
  readonly disabled?: boolean
}

interface SearchableSelectProps {
  readonly id?: string
  readonly 'aria-label'?: string
  readonly 'aria-labelledby'?: string
  readonly options: ReadonlyArray<SearchableSelectOption>
  readonly value?: string
  readonly onValueChange: (value: string) => void
  readonly placeholder?: string
  readonly searchPlaceholder?: string
  readonly emptyMessage?: string
  readonly disabled?: boolean
  readonly className?: string
  readonly triggerClassName?: string
  readonly popoverClassName?: string
  readonly size?: 'default' | 'sm'
  readonly sublabelPosition?: 'start' | 'end'
  readonly layout?: 'inline' | 'stacked'
  readonly hasNextPage?: boolean
  readonly isFetchingNextPage?: boolean
  readonly onLoadMore?: () => void
}

export const SearchableSelect = ({
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  options,
  value,
  onValueChange,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum resultado encontrado.',
  disabled = false,
  className,
  triggerClassName,
  popoverClassName,
  size = 'default',
  layout = 'inline',
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const listRef = useRef<HTMLDivElement | null>(null)
  const listboxId = useId()
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )
  const shouldVirtualize = options.length >= VIRTUALIZATION_THRESHOLD
  const filteredOptions = useMemo(() => {
    if (!shouldVirtualize || !searchValue.trim()) return options
    return options.filter((option) =>
      matchesSearchText(
        `${option.label} ${option.value} ${option.badge ?? ''} ${option.sublabel ?? ''}`,
        searchValue,
      ),
    )
  }, [options, searchValue, shouldVirtualize])
  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => listRef.current,
    estimateSize: () =>
      isDesktop ? DESKTOP_OPTION_ESTIMATED_HEIGHT : MOBILE_OPTION_ESTIMATED_HEIGHT,
    overscan: 8,
  })

  useEffect(() => {
    setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1)
    if (shouldVirtualize && open && filteredOptions.length > 0) {
      virtualizer.scrollToIndex(0)
    }
  }, [filteredOptions.length, open, searchValue, shouldVirtualize, virtualizer])

  const isStacked = layout === 'stacked'
  const selectOption = (option: SearchableSelectOption) => {
    if (option.disabled) return
    onValueChange(option.value)
    setOpen(false)
    setSearchValue('')
  }

  const handleListScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || isFetchingNextPage || !onLoadMore) return
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 60) {
      onLoadMore()
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setSearchValue('')
      }}
    >
      <PopoverTrigger
        render={
          <Button
            id={id}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            type="button"
            variant="outline"
            size={size === 'sm' ? 'sm' : 'default'}
            disabled={disabled}
            className={cn(
              'bg-background w-full min-w-0 justify-between overflow-hidden text-left font-normal',
              isStacked
                ? 'h-auto min-h-11 px-3 py-2 text-base sm:min-h-9 sm:py-1.5 sm:text-sm'
                : size === 'sm'
                  ? 'h-10 px-3 text-sm sm:h-7 sm:px-2.5 sm:text-xs'
                  : 'h-11 px-3 text-base sm:h-8 sm:text-sm',
              !selectedOption && 'text-muted-foreground',
              triggerClassName,
            )}
          />
        }
      >
        <span
          className={cn(
            'min-w-0 flex-1 text-left',
            isStacked ? 'leading-snug break-words whitespace-normal' : 'truncate',
          )}
          title={selectedOption?.label ?? placeholder}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronsUpDown className="ml-1.5 size-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'w-[calc(100vw-2rem)] max-w-[540px] p-0 shadow-lg sm:w-[max(var(--anchor-width),380px)] sm:min-w-[280px]',
          popoverClassName ?? className,
        )}
        align="start"
      >
        {shouldVirtualize ? (
          <div className="bg-popover flex w-full flex-col overflow-hidden rounded-xl p-1">
            <div className="relative p-1 pb-0">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
              <Input
                autoFocus
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-activedescendant={
                  highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined
                }
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown' && filteredOptions.length > 0) {
                    event.preventDefault()
                    const next =
                      highlightedIndex < filteredOptions.length - 1 ? highlightedIndex + 1 : 0
                    setHighlightedIndex(next)
                    virtualizer.scrollToIndex(next, { align: 'auto' })
                  } else if (event.key === 'ArrowUp' && filteredOptions.length > 0) {
                    event.preventDefault()
                    const next =
                      highlightedIndex > 0 ? highlightedIndex - 1 : filteredOptions.length - 1
                    setHighlightedIndex(next)
                    virtualizer.scrollToIndex(next, { align: 'auto' })
                  } else if (event.key === 'Enter' && highlightedIndex >= 0) {
                    event.preventDefault()
                    const option = filteredOptions[highlightedIndex]
                    if (option) selectOption(option)
                  } else if (event.key === 'Escape') {
                    event.preventDefault()
                    setOpen(false)
                  }
                }}
                className="bg-input/30 h-11 border-0 pl-9 text-base shadow-none focus-visible:ring-0 sm:h-8 sm:pl-8 sm:text-xs"
              />
            </div>
            {filteredOptions.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center text-xs">{emptyMessage}</div>
            ) : (
              <div
                ref={listRef}
                id={listboxId}
                role="listbox"
                className="max-h-64 overflow-y-auto overscroll-contain p-1 outline-hidden"
                onScroll={handleListScroll}
              >
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    position: 'relative',
                    width: '100%',
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualItem) => {
                    const option = filteredOptions[virtualItem.index]
                    if (!option) return null
                    const selected = option.value === value
                    const highlighted = highlightedIndex === virtualItem.index
                    return (
                      <button
                        key={option.value}
                        id={`${listboxId}-option-${virtualItem.index}`}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={option.disabled}
                        onMouseEnter={() => setHighlightedIndex(virtualItem.index)}
                        onClick={() => selectOption(option)}
                        className={cn(
                          'hover:bg-accent absolute left-0 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-base disabled:pointer-events-none disabled:opacity-50 sm:min-h-8 sm:rounded-md sm:px-2.5 sm:py-1.5 sm:text-xs',
                          highlighted && 'bg-muted text-foreground',
                        )}
                        style={{ transform: `translateY(${virtualItem.start}px)` }}
                      >
                        <Check
                          className={cn(
                            'text-primary size-3.5 shrink-0',
                            selected ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Command className="w-full">
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-11 text-base sm:h-8 sm:text-xs"
            />
            <CommandList
              className="max-h-64 [scrollbar-gutter:stable] overflow-y-auto p-1"
              onScroll={handleListScroll}
            >
              <CommandEmpty className="text-muted-foreground py-4 text-center text-xs">
                {emptyMessage}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const selected = option.value === value
                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.value} ${option.badge ?? ''} ${option.sublabel ?? ''}`}
                      disabled={option.disabled}
                      onSelect={() => {
                        selectOption(option)
                      }}
                      className="hover:bg-accent flex min-h-11 cursor-pointer items-center rounded-lg px-3 py-2 text-base sm:min-h-8 sm:rounded-md sm:px-2.5 sm:py-1.5 sm:text-xs"
                    >
                      <Check
                        className={cn(
                          'text-primary size-4 shrink-0',
                          selected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span
                        className={cn('min-w-0 flex-1 truncate', selected && 'font-semibold')}
                        title={option.label}
                      >
                        {option.label}
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {isFetchingNextPage && (
                <div className="text-muted-foreground flex items-center justify-center gap-1.5 py-2 text-xs">
                  <span className="inline-block size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Carregando mais...</span>
                </div>
              )}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  )
}
