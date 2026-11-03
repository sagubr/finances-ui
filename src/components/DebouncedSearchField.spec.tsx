import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DebouncedSearchField } from './DebouncedSearchField'

describe('DebouncedSearchField', () => {
  afterEach(() => vi.useRealTimers())

  it('updates the visible input immediately and emits only after inactivity', () => {
    vi.useFakeTimers()
    const onValueChange = vi.fn()
    render(<DebouncedSearchField value="" onValueChange={onValueChange} placeholder="Buscar" />)

    const input = screen.getByPlaceholderText('Buscar')
    fireEvent.change(input, { target: { value: 'receita' } })
    expect((input as HTMLInputElement).value).toBe('receita')
    expect(onValueChange).not.toHaveBeenCalled()

    void act(() => vi.advanceTimersByTime(300))
    expect(onValueChange).toHaveBeenCalledOnce()
    expect(onValueChange).toHaveBeenCalledWith('receita')
  })

  it('keeps an external value change without re-emitting the stale draft', () => {
    vi.useFakeTimers()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <DebouncedSearchField value="antigo" onValueChange={onValueChange} placeholder="Buscar" />,
    )

    fireEvent.change(screen.getByPlaceholderText('Buscar'), { target: { value: 'rascunho' } })
    rerender(<DebouncedSearchField value="" onValueChange={onValueChange} placeholder="Buscar" />)
    expect((screen.getByPlaceholderText('Buscar') as HTMLInputElement).value).toBe('')
    const replacementHandler = vi.fn()
    rerender(
      <DebouncedSearchField value="" onValueChange={replacementHandler} placeholder="Buscar" />,
    )

    void act(() => vi.advanceTimersByTime(300))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(replacementHandler).not.toHaveBeenCalled()
  })
})
