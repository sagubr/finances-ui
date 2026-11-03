import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TipCard } from './tip-card'

describe('TipCard', () => {
  beforeEach(() => localStorage.clear())

  it('executa a ação contextual sem dispensar a dica', () => {
    const onClick = vi.fn()
    render(
      <TipCard
        id="explore.choose-source.v1"
        title="Escolha uma fonte"
        description="Defina onde estão os dados."
        action={{ label: 'Escolher fonte', onClick }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Escolher fonte' }))

    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.getByRole('note')).toBeTruthy()
  })

  it('persiste a dispensa e expõe um nome acessível no botão', () => {
    const onDismiss = vi.fn()
    const { unmount } = render(
      <TipCard
        id="explore.add-fields.v1"
        title="Adicione campos"
        description="Escolha os dados relevantes."
        onDismiss={onDismiss}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Dispensar dica' }))

    expect(onDismiss).toHaveBeenCalledOnce()
    expect(localStorage.getItem('tip_dismissed_explore.add-fields.v1')).toBe('true')

    unmount()
    render(
      <TipCard
        id="explore.add-fields.v1"
        title="Adicione campos"
        description="Escolha os dados relevantes."
      />,
    )
    expect(screen.queryByText('Adicione campos')).toBeNull()
  })

  it('usa status apenas para dicas de alerta', () => {
    render(
      <TipCard
        id="explore.warning.v1"
        title="Atenção"
        description="Revise a configuração."
        tone="warning"
      />,
    )
    expect(screen.getByRole('status')).toBeTruthy()
  })
})
