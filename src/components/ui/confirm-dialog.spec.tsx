import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from './confirm-dialog'

describe('ConfirmDialog', () => {
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
  })
})
