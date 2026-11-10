import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const resetPasswordMock = vi.hoisted(() => vi.fn())
vi.mock('@/api/auth', () => ({ resetPassword: resetPasswordMock }))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}))
vi.mock('./AuthPageShell', () => ({
  AuthPageShell: ({ children, title }: { children: ReactNode; title: string }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}))

import { ResetPassword } from './ResetPassword'

const renderResetPassword = (initialToken = 'a'.repeat(43)) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ResetPassword initialToken={initialToken} />
    </QueryClientProvider>,
  )

describe('ResetPassword', () => {
  it('não exibe o token recebido pelo link', () => {
    renderResetPassword()

    expect(screen.queryByLabelText('Código de recuperação')).toBeNull()
    expect(screen.queryByDisplayValue('a'.repeat(43))).toBeNull()
  })

  it('permite visualizar cada senha sem expor a outra', () => {
    renderResetPassword()
    const password = screen.getByLabelText('Nova senha')
    const confirmation = screen.getByLabelText('Confirme a nova senha')

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar nova senha' }))
    expect(password.getAttribute('type')).toBe('text')
    expect(confirmation.getAttribute('type')).toBe('password')

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar confirme a nova senha' }))
    expect(confirmation.getAttribute('type')).toBe('text')
  })

  it('avisa quando as senhas não coincidem antes do envio', async () => {
    renderResetPassword()
    fireEvent.change(screen.getByLabelText('Nova senha'), {
      target: { value: 'senha-segura-123' },
    })
    const confirmation = screen.getByLabelText('Confirme a nova senha')
    fireEvent.change(confirmation, { target: { value: 'senha-diferente' } })
    fireEvent.blur(confirmation)

    expect(await screen.findByText('As senhas não coincidem')).toBeTruthy()
    expect(resetPasswordMock).not.toHaveBeenCalled()
  })

  it('mantém o campo de código como fallback quando a página é aberta sem link', () => {
    renderResetPassword('')
    expect(screen.getByLabelText('Código de recuperação')).toBeTruthy()
  })
})
