import type { Filter, FilterFieldConfig } from '@/components/ui/filters'
import { Filters } from '@/components/ui/filters'
import { RippleButton } from '@/components/ui/ripple-button'
import { filtersPtBrI18n } from '@/lib/filters-i18n'
import { FunnelX, ListFilter } from 'lucide-react'
import React, { useMemo } from 'react'

export interface DataFilterColumn {
  key: string
  label: string
}
export interface DataTableFiltersProps {
  data: ReadonlyArray<Record<string, unknown>>
  columns: DataFilterColumn[]
  filters: Filter<unknown>[]
  onChange: (filters: Filter<unknown>[]) => void
  label?: string
}

export function applyDataFilters<T extends Record<string, unknown>>(
  data: ReadonlyArray<T>,
  filters: Filter<unknown>[],
): T[] {
  if (!filters.length) return [...data]

  const preparedFilters = filters.map((filter) => ({
    field: filter.field,
    operator: filter.operator,
    valueSet: new Set(filter.values.map((candidate) => String(candidate))),
    hasValues: filter.values.length > 0,
  }))

  return data.filter((row) => {
    for (let i = 0; i < preparedFilters.length; i++) {
      const filter = preparedFilters[i]
      const value = row[filter.field]
      if (filter.operator === 'empty') {
        if (value !== null && value !== undefined && value !== '') return false
        continue
      }
      if (filter.operator === 'not_empty') {
        if (value === null || value === undefined || value === '') return false
        continue
      }
      const contains = filter.valueSet.has(String(value))
      if (['is_not', 'is_not_any_of', 'excludes_all'].includes(filter.operator)) {
        if (contains) return false
        continue
      }
      if (filter.hasValues && !contains) {
        return false
      }
    }
    return true
  })
}

export const DataTableFilters = React.memo(function DataTableFilters({
  data,
  columns,
  filters,
  onChange,
  label = 'Filtrar dados',
}: DataTableFiltersProps) {
  const fields = useMemo<FilterFieldConfig<unknown>[]>(() => {
    if (!data.length || !columns.length) return []

    // Passagem única para coletar valores únicos sem alocações massivas no Garbage Collector
    const columnKeys = columns.map((col) => col.key)
    const uniqueValuesByColumn = new Map<string, Set<unknown>>()
    for (let i = 0; i < columnKeys.length; i++) {
      uniqueValuesByColumn.set(columnKeys[i], new Set())
    }

    const rowCount = data.length
    for (let i = 0; i < rowCount; i++) {
      const row = data[i]
      if (!row) continue
      for (let j = 0; j < columnKeys.length; j++) {
        const key = columnKeys[j]
        const val = row[key]
        if (val !== null && val !== undefined) {
          uniqueValuesByColumn.get(key)?.add(val)
        }
      }
    }

    return columns.map(({ key, label: fieldLabel }) => {
      const valSet = uniqueValuesByColumn.get(key)
      const options: Array<{ value: unknown; label: string }> = []
      if (valSet) {
        for (const val of valSet) {
          options.push({ value: val, label: String(val) })
        }
      }
      return {
        key,
        label: fieldLabel,
        type: 'multiselect',
        searchable: true,
        options,
      }
    })
  }, [columns, data])
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="presentation"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <Filters
        filters={filters}
        fields={fields}
        onChange={onChange}
        i18n={filtersPtBrI18n}
        size="sm"
        variant="solid"
        trigger={
          <RippleButton variant="outline" size="sm" className="h-8 text-xs">
            <ListFilter className="mr-1 size-3.5" />
            {label}
          </RippleButton>
        }
      />
      {filters.length > 0 && (
        <RippleButton
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 h-8 text-xs"
          onClick={() => onChange([])}
        >
          <FunnelX className="mr-1 size-3.5" />
          Limpar
        </RippleButton>
      )}
    </div>
  )
})
