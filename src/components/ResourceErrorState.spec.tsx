import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ResourceErrorState } from './ResourceErrorState'

describe('ResourceErrorState', () => {
  it('exibe mensagem contextual e permite tentar novamente', () => {
    const retry = vi.fn()
    render(
      <ResourceErrorState
        title="Não foi possível carregar os dashboards"
        error={new Error('Network Error')}
        fallbackMessage="Verifique sua conexão e tente novamente."
        onRetry={retry}
      />,
    )

    expect(screen.getByText('Não foi possível carregar os dashboards')).toBeTruthy()
    expect(screen.getByText('Verifique sua conexão e tente novamente.')).toBeTruthy()
    expect(screen.queryByText('Network Error')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('bloqueia nova tentativa enquanto os dados estão sendo recarregados', () => {
    render(
      <ResourceErrorState
        title="Falha"
        error={new Error('Network Error')}
        fallbackMessage="Tente novamente."
        onRetry={vi.fn()}
        isRetrying
      />,
    )

    expect(
      (screen.getByRole('button', { name: 'Tentar novamente' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })
})
