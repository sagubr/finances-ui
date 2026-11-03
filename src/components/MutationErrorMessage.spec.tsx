import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MutationErrorMessage } from './MutationErrorMessage'

describe('MutationErrorMessage', () => {
  it('não renderiza alerta sem erro', () => {
    render(<MutationErrorMessage error={null} />)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('apresenta uma mensagem segura para a falha', () => {
    render(<MutationErrorMessage error={new Error('Falha ao salvar.')} />)
    expect(screen.getByRole('alert').textContent).toContain('Falha ao salvar.')
  })
})
