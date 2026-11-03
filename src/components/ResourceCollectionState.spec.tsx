import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ResourceCollectionSkeleton, ResourceEmptyState } from './ResourceCollectionState'

describe('resource collection states', () => {
  it('uses the table skeleton for list mode', () => {
    render(<ResourceCollectionSkeleton viewMode="list" />)
    expect(screen.getByLabelText('Carregando tabela')).toBeTruthy()
    expect(screen.queryByLabelText('Carregando conteúdo')).toBeNull()
  })

  it('uses the card skeleton for grid mode', () => {
    render(<ResourceCollectionSkeleton viewMode="grid" />)
    expect(screen.getByLabelText('Carregando conteúdo')).toBeTruthy()
    expect(screen.queryByLabelText('Carregando tabela')).toBeNull()
  })

  it('offers the contextual empty action', () => {
    const onAction = vi.fn()
    render(
      <ResourceEmptyState
        title="Nenhum registro"
        description="Cadastre o primeiro item."
        actionLabel="Cadastrar item"
        onAction={onAction}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar item' }))
    expect(onAction).toHaveBeenCalledOnce()
  })
})
