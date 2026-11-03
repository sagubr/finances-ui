import { render, screen } from '@testing-library/react'
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
})
