import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const registerUserMock = vi.hoisted(() => vi.fn())
vi.mock('@/api/auth', () => ({ registerUser: registerUserMock }))
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

import { Register } from './Register'

const renderRegister = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Register />
    </QueryClientProvider>,
  )

const fillRegistration = (password: string) => {
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Gustavo' } })
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'gustavo@example.com' } })
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: password } })
  fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: password } })
}

describe('Register', () => {
  it('permite visualizar cada senha de forma independente', () => {
    renderRegister()
    const password = screen.getByLabelText('Senha')
    const confirmation = screen.getByLabelText('Confirmar senha')

    expect(password.getAttribute('type')).toBe('password')
    expect(confirmation.getAttribute('type')).toBe('password')

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(password.getAttribute('type')).toBe('text')
    expect(confirmation.getAttribute('type')).toBe('password')

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar confirmar senha' }))
    expect(confirmation.getAttribute('type')).toBe('text')
  })

  it('não envia senha menor que oito caracteres', async () => {
    renderRegister()
    fillRegistration('curta')
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }))
    await waitFor(() => expect(screen.getByText('Use pelo menos 8 caracteres')).toBeTruthy())
    expect(registerUserMock).not.toHaveBeenCalled()
  })

  it('avisa assim que a confirmação não coincide com a senha', async () => {
    renderRegister()
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha-segura-123' } })
    const confirmation = screen.getByLabelText('Confirmar senha')
    fireEvent.change(confirmation, { target: { value: 'senha-diferente' } })
    fireEvent.blur(confirmation)

    expect(await screen.findByText('As senhas não coincidem')).toBeTruthy()
    expect(registerUserMock).not.toHaveBeenCalled()
  })

  it('envia cadastro válido pelo contrato de identidade', async () => {
    registerUserMock.mockResolvedValueOnce({
      userId: '018f1f7e-7b5c-7a3d-8c9e-0123456789ab',
      workspaceId: '018f1f7e-7b5c-7a3d-8c9e-0123456789ac',
      emailConfirmationRequired: false,
    })
    renderRegister()
    fillRegistration('senha-segura-123')
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }))
    await waitFor(() => expect(registerUserMock).toHaveBeenCalledOnce())
    expect(registerUserMock.mock.calls[0]?.[0]).toEqual({
      displayName: 'Gustavo',
      email: 'gustavo@example.com',
      password: 'senha-segura-123',
    })
    expect(await screen.findByText('Conta criada')).toBeTruthy()
  })
})
