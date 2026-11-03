import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GlobalErrorBoundary } from './index'

const ProblemChild = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Falha simulada no teste')
  }
  return <div>Conteúdo renderizado com sucesso</div>
}

describe('GlobalErrorBoundary', () => {
  it('renderiza os filhos normalmente quando não há erro', () => {
    render(
      <GlobalErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </GlobalErrorBoundary>,
    )

    expect(screen.getByText('Conteúdo renderizado com sucesso')).toBeTruthy()
  })

  it('captura exceções e exibe o fallback padrão amigável', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <GlobalErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </GlobalErrorBoundary>,
    )

    expect(screen.getByText('Ocorreu um erro inesperado')).toBeTruthy()
    expect(screen.getByText('Tentar novamente')).toBeTruthy()
    expect(screen.getByText('Recarregar aplicação')).toBeTruthy()

    consoleError.mockRestore()
  })

  it('permite passar fallback customizado como função', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <GlobalErrorBoundary
        fallback={({ error, reset }) => (
          <div>
            <span>Erro capturado: {error.message}</span>
            <button onClick={reset}>Resetar</button>
          </div>
        )}
      >
        <ProblemChild shouldThrow={true} />
      </GlobalErrorBoundary>,
    )

    expect(screen.getByText('Erro capturado: Falha simulada no teste')).toBeTruthy()
    expect(screen.getByText('Resetar')).toBeTruthy()

    consoleError.mockRestore()
  })

  it('chama onCatch quando fornecido', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onCatch = vi.fn()

    render(
      <GlobalErrorBoundary onCatch={onCatch}>
        <ProblemChild shouldThrow={true} />
      </GlobalErrorBoundary>,
    )

    expect(onCatch).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Falha simulada no teste' }),
      expect.any(Object),
    )

    consoleError.mockRestore()
  })
})
