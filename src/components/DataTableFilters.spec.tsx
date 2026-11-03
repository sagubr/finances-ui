import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { applyDataFilters, DataTableFilters } from './DataTableFilters'

describe('DataTableFilters', () => {
  it('não propaga o clique do filtro para o container do widget', () => {
    const onWidgetClick = vi.fn()

    render(
      <div
        role="button"
        tabIndex={0}
        aria-label="Widget container"
        onClick={onWidgetClick}
        onKeyDown={onWidgetClick}
      >
        <DataTableFilters
          data={[{ status: 'Ativo' }]}
          columns={[{ key: 'status', label: 'Status' }]}
          filters={[]}
          onChange={vi.fn()}
          label="Filtrar tabela"
        />
      </div>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filtrar tabela' }))

    expect(onWidgetClick).not.toHaveBeenCalled()
  })

  describe('applyDataFilters', () => {
    const dataset = [
      { id: 1, city: 'São Paulo', status: 'Ativo', total: 100 },
      { id: 2, city: 'Rio de Janeiro', status: 'Inativo', total: 200 },
      { id: 3, city: 'Belo Horizonte', status: 'Ativo', total: null },
      { id: 4, city: 'São Paulo', status: 'Pendente', total: 300 },
    ]

    it('retorna os mesmos dados se não houver filtros', () => {
      expect(applyDataFilters(dataset, [])).toEqual(dataset)
    })

    it('filtra registros por valor incluído', () => {
      const filtered = applyDataFilters(dataset, [
        { id: 'f1', field: 'city', operator: 'is_any_of', values: ['São Paulo'] },
      ])
      expect(filtered).toHaveLength(2)
      expect(filtered.map((d) => d.id)).toEqual([1, 4])
    })

    it('filtra registros por exclusão (is_not / is_not_any_of)', () => {
      const filtered = applyDataFilters(dataset, [
        { id: 'f1', field: 'status', operator: 'is_not', values: ['Ativo'] },
      ])
      expect(filtered).toHaveLength(2)
      expect(filtered.map((d) => d.id)).toEqual([2, 4])
    })

    it('filtra campos vazios (empty) e não vazios (not_empty)', () => {
      const emptyTotal = applyDataFilters(dataset, [
        { id: 'f1', field: 'total', operator: 'empty', values: [] },
      ])
      expect(emptyTotal).toHaveLength(1)
      expect(emptyTotal[0].id).toBe(3)

      const notEmptyTotal = applyDataFilters(dataset, [
        { id: 'f2', field: 'total', operator: 'not_empty', values: [] },
      ])
      expect(notEmptyTotal).toHaveLength(3)
      expect(notEmptyTotal.map((d) => d.id)).toEqual([1, 2, 4])
    })

    it('processa grandes volumes de 30 mil registros sem degradação', () => {
      const largeData = Array.from({ length: 30000 }, (_, i) => ({
        id: i,
        status: i % 2 === 0 ? 'Ativo' : 'Inativo',
        region: `Região ${i % 10}`,
      }))

      const start = performance.now()
      const result = applyDataFilters(largeData, [
        { id: 'f1', field: 'status', operator: 'is_any_of', values: ['Ativo'] },
        { id: 'f2', field: 'region', operator: 'is_any_of', values: ['Região 0', 'Região 1'] },
      ])
      const elapsed = performance.now() - start

      expect(result.length).toBe(3000)
      expect(elapsed).toBeLessThan(100) // deve executar em poucos milissegundos
    })
  })
})
