import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchableSelect } from './searchable-select'

describe('SearchableSelect', () => {
  it('propaga identificação e nome acessível ao gatilho', () => {
    render(
      <SearchableSelect
        id="accountId"
        aria-label="Conta de origem"
        value="account-a"
        onValueChange={vi.fn()}
        options={[{ value: 'account-a', label: 'Conta principal' }]}
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Conta de origem' })
    expect(trigger.getAttribute('id')).toBe('accountId')
  })

  it('mantém gatilho e opções minimalistas, sem badges ou textos auxiliares', async () => {
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    })
    render(
      <SearchableSelect
        aria-label="Categoria"
        value="food"
        onValueChange={vi.fn()}
        options={[
          {
            value: 'food',
            label: 'Alimentação',
            badge: 'Despesa',
            sublabel: 'Categoria padrão',
          },
        ]}
      />,
    )

    expect(screen.getByText('Alimentação')).toBeTruthy()
    expect(screen.queryByText('Despesa')).toBeNull()
    expect(screen.queryByText('Categoria padrão')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Categoria' }))

    expect(await screen.findByRole('option', { name: 'Alimentação' })).toBeTruthy()
    expect(screen.queryByText('Despesa')).toBeNull()
    expect(screen.queryByText('Categoria padrão')).toBeNull()
  })
})
