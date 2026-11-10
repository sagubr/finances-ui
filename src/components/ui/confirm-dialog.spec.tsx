import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from './confirm-dialog'

const setDesktopViewport = (matches: boolean) => {
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as MediaQueryList,
  )
}

describe('ConfirmDialog', () => {
  afterEach(() => setDesktopViewport(false))

  it('mantém o diálogo aberto e apresenta a falha da confirmação', async () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={vi.fn()}
        title="Excluir registro?"
        onConfirm={() => Promise.reject(new Error('Não foi possível excluir o registro.'))}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    await waitFor(() =>
      expect(screen.getByText('Não foi possível excluir o registro.')).toBeTruthy(),
    )
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(document.querySelector('[data-slot="drawer-popup"]')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Fechar' })).toBeNull()
  })

  it('preserva o dialog centralizado em viewport desktop', () => {
    setDesktopViewport(true)

    render(
      <ConfirmDialog open onOpenChange={vi.fn()} title="Excluir registro?" onConfirm={vi.fn()} />,
    )

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(document.querySelector('[data-slot="drawer-popup"]')).toBeNull()
    expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeTruthy()
  })
})
