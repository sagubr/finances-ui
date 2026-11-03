import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SettingsPageState, SettingsRetryAction } from './SettingsPageState'

describe('SettingsPageState', () => {
  it('uses a live status for a valid unavailable state', () => {
    render(
      <SettingsPageState
        variant="unavailable"
        title="Recurso indisponível"
        description="A integração ainda não foi configurada."
      />,
    )

    expect(screen.getByRole('status').getAttribute('aria-live')).toBeNull()
    expect(screen.getByText('Recurso indisponível')).toBeTruthy()
  })

  it('uses an alert for errors and invokes an explicit retry action', () => {
    const onRetry = vi.fn()
    render(
      <SettingsPageState
        variant="error"
        title="Falha ao carregar"
        description="Tente novamente."
        action={<SettingsRetryAction onRetry={onRetry} />}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
