import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { SearchableSelectOption } from '@/components/ui/searchable-select'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import React, { useMemo, useState } from 'react'

export interface SearchableMultiSelectProps {
  readonly options: ReadonlyArray<SearchableSelectOption>
  readonly selectedValues: readonly string[]
  readonly onValuesChange?: (values: string[]) => void
  readonly onToggleValue?: (value: string) => void
  readonly onClearAll?: () => void
  readonly onSelectAll?: () => void
  readonly placeholder?: string
  readonly searchPlaceholder?: string
  readonly emptyMessage?: string
  readonly disabled?: boolean
  readonly className?: string
  readonly triggerClassName?: string
  readonly popoverClassName?: string
  readonly size?: 'default' | 'sm'
}

export const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  options,
  selectedValues = [],
  onValuesChange,
  onToggleValue,
  onClearAll,
  onSelectAll,
  placeholder = 'Selecione as colunas...',
  searchPlaceholder = 'Buscar colunas...',
  emptyMessage = 'Nenhuma coluna encontrada.',
  disabled = false,
  className,
  triggerClassName,
  popoverClassName,
  size = 'default',
}) => {
  const [open, setOpen] = useState(false)
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues])

  const handleToggle = (val: string) => {
    const isSelected = selectedSet.has(val)
    const nextValues = isSelected
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val]
    onValuesChange?.(nextValues)
    onToggleValue?.(val)
  }

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSelectAll) {
      onSelectAll()
      return
    }
    const allValues = options.map((opt) => opt.value)
    onValuesChange?.(allValues)
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClearAll) {
      onClearAll()
      return
    }
    onValuesChange?.([])
  }

  const formattedText = useMemo(() => {
    if (!selectedValues || selectedValues.length === 0) {
      return null
    }
    const firstOption = options.find((opt) => opt.value === selectedValues[0])
    const firstLabel = firstOption ? firstOption.label : selectedValues[0]
    if (selectedValues.length === 1) {
      return firstLabel
    }
    return `${firstLabel} (+${selectedValues.length - 1} mais)`
  }, [selectedValues, options])

  return (
    <div className={cn('w-full min-w-0', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size={size === 'sm' ? 'sm' : 'default'}
              disabled={disabled}
              className={cn(
                'bg-background w-full min-w-0 justify-between overflow-hidden text-left font-normal',
                size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-sm',
                (!selectedValues || selectedValues.length === 0) && 'text-muted-foreground',
                triggerClassName,
              )}
            />
          }
        >
          <span className="min-w-0 flex-1 truncate text-xs" title={formattedText ?? placeholder}>
            {formattedText ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-1.5 size-3.5 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            'w-[max(var(--anchor-width),340px)] max-w-[min(90vw,540px)] min-w-[220px] p-0 shadow-lg',
            popoverClassName,
          )}
          align="start"
        >
          <Command className="w-full">
            <CommandInput placeholder={searchPlaceholder} className="h-8 text-xs" />
            <CommandList className="max-h-60 overflow-y-auto p-1">
              <CommandEmpty className="text-muted-foreground py-4 text-center text-xs">
                {emptyMessage}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const selected = selectedSet.has(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.value} ${option.sublabel ?? ''}`}
                      disabled={option.disabled}
                      onSelect={() => handleToggle(option.value)}
                      className="hover:bg-accent flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <Check
                          className={cn(
                            'text-primary size-3.5 shrink-0',
                            selected ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <span
                          className={cn(
                            'truncate text-xs',
                            selected && 'text-primary font-semibold',
                          )}
                          title={option.label}
                        >
                          {option.label}
                        </span>
                      </div>
                      {option.sublabel && (
                        <span className="text-muted-foreground bg-muted/70 border-border/40 ml-2 shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase">
                          {option.sublabel}
                        </span>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
            {options.length > 0 && (
              <div className="border-border/60 bg-muted/20 flex items-center justify-between border-t px-2.5 py-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-primary cursor-pointer font-medium hover:underline"
                >
                  Selecionar todas
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-muted-foreground hover:text-foreground ml-auto cursor-pointer font-medium"
                >
                  Limpar
                </button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
