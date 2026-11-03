import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { matchesSearchText } from '@/lib/search-text'
import { cn } from '@/lib/utils'
import type { Column } from '@tanstack/react-table'
import { ListFilter } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'

export const Filter: React.FC<{ column: Column<any, unknown> }> = React.memo(({ column }) => {
  const columnFilterValue = (column.getFilterValue() as any[]) || []
  const columnTitle = column.columnDef.header

  const sortedUniqueValues = useMemo(() => {
    return Array.from(column.getFacetedUniqueValues().keys())
      .filter((val) => val !== undefined && val !== null && val !== '')
      .sort()
  }, [column.getFacetedUniqueValues()])

  const [searchTerm, setSearchTerm] = useState('')

  const filteredUniqueValues = useMemo(() => {
    return sortedUniqueValues.filter((val) => matchesSearchText(val, searchTerm))
  }, [sortedUniqueValues, searchTerm])

  const handleSelectValue = useCallback(
    (value: any, checked: boolean) => {
      const nextValues = checked
        ? [...columnFilterValue, value]
        : columnFilterValue.filter((val) => val !== value)
      column.setFilterValue(nextValues.length > 0 ? nextValues : undefined)
    },
    [column, columnFilterValue],
  )

  const handleClear = useCallback(() => {
    column.setFilterValue(undefined)
    setSearchTerm('')
  }, [column])

  const allSelected =
    sortedUniqueValues.length > 0 && columnFilterValue.length === sortedUniqueValues.length

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      column.setFilterValue(undefined)
      return
    }
    column.setFilterValue(sortedUniqueValues)
  }, [allSelected, column, sortedUniqueValues])

  const isSelected = useCallback(
    (value: any) => columnFilterValue.includes(value),
    [columnFilterValue],
  )

  return (
    <div className="mt-1">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="border-border/80 bg-muted/50 hover:bg-muted flex h-8 w-full items-center justify-between gap-2 truncate border text-xs font-normal"
            />
          }
        >
          <div className="flex items-center gap-1.5 truncate">
            <ListFilter className="text-foreground/70 size-3 shrink-0" />
            <span className="text-foreground/70 truncate">{columnTitle?.toString()}:</span>
            <span className="text-foreground truncate font-medium">
              {columnFilterValue.length === 0 ? 'Todos' : `${columnFilterValue.length} sel.`}
            </span>
          </div>
          {columnFilterValue.length > 0 && (
            <Badge
              size="sm"
              variant="secondary"
              className="border-primary/20 bg-primary/10 text-primary shrink-0 rounded-sm"
            >
              {columnFilterValue.length}
            </Badge>
          )}
        </PopoverTrigger>

        <PopoverContent className="w-56 p-1.5" align="start" sideOffset={4}>
          <div className="text-foreground/70 px-2 py-1.5 text-xs font-semibold">
            Filtrar {columnTitle?.toString()}
          </div>

          {/* Search input — works freely inside Popover, no Menu type-ahead interference */}
          <div className="px-2 py-1.5">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-7 px-2 text-xs"
              autoFocus
            />
          </div>

          <div className="bg-border -mx-1.5 my-0.5 h-px" />

          <div className="max-h-48 overflow-y-auto py-1">
            {filteredUniqueValues.length === 0 ? (
              <div className="text-foreground/70 px-2 py-1.5 text-center text-xs">
                Nenhum valor encontrado
              </div>
            ) : (
              filteredUniqueValues.map((value: any) => (
                <label
                  key={String(value)}
                  className={cn(
                    'relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs select-none',
                    'hover:bg-accent hover:text-accent-foreground',
                    isSelected(value) && 'bg-accent/50',
                  )}
                >
                  <Checkbox
                    checked={isSelected(value)}
                    onCheckedChange={(checked) => handleSelectValue(value, !!checked)}
                    className="size-3.5 shrink-0"
                  />
                  <span className="truncate">{String(value)}</span>
                </label>
              ))
            )}
          </div>

          <div className="bg-border -mx-1.5 my-0.5 h-px" />

          <div className="flex items-center justify-between gap-1 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-6 w-full justify-center px-2 text-[10px]"
            >
              {allSelected ? 'Desmarcar todos' : 'Marcar todos'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-6 w-full justify-center px-2 text-[10px]"
              disabled={columnFilterValue.length === 0}
            >
              Limpar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
})
Filter.displayName = 'Filter'
