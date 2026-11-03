import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RootError } from './RootError'

describe('RootError', () => {
  it('apresenta erro genérico sem tratá-lo como página inexistente', () => {
    const retry = vi.fn()
    render(<RootError error={new Error('Falha de renderização')} onRetry={retry} />)

    expect(screen.getByText('Não foi possível abrir esta página')).toBeTruthy()
    expect(screen.queryByText(/não encontrada/i)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
