import { SearchableSelect } from '@/components/ui/searchable-select'
import { useActiveDataSource } from '@/modules/data-sources/hooks/useActiveDataSource'
import { Cable } from 'lucide-react'
import { useMemo } from 'react'

export function DataSourceContextSelector() {
  const { activeDataSourceId, availableSources, isLoading, selectDataSource } = useActiveDataSource(
    { syncUrl: true },
  )
  const options = useMemo(
    () =>
      availableSources.map((source) => ({
        value: source.id,
        label: source.name,
        badge: source.driver.toUpperCase(),
      })),
    [availableSources],
  )

  if (!isLoading && options.length === 0) return null

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Cable className="text-muted-foreground hidden size-3.5 shrink-0 xl:block" />
      <SearchableSelect
        options={options}
        value={activeDataSourceId}
        onValueChange={selectDataSource}
        placeholder={isLoading ? 'Carregando fontes...' : 'Selecionar fonte'}
        searchPlaceholder="Buscar fonte de dados..."
        emptyMessage="Nenhuma fonte ativa disponível."
        triggerClassName="h-8 w-32 sm:w-44 lg:w-52"
        disabled={isLoading}
      />
    </div>
  )
}
