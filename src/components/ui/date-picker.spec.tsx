import { toCivilDate } from '@/utils/date'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DatePicker, DateRangePicker } from './date-picker'

describe('manual date input', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })
  })

  it('preserva a data ao focar e desfocar sem editar', () => {
    const onChange = vi.fn()
    render(<DatePicker value={new Date(2026, 9, 13)} onChange={onChange} />)

    fireEvent.click(screen.getByTitle('Digitar data manualmente'))
    fireEvent.blur(screen.getByPlaceholderText('DD/MM/YYYY'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('confirma imediatamente uma data simples escolhida no calendário', () => {
    const onChange = vi.fn()
    render(<DatePicker value={new Date(2026, 10, 2, 12)} onChange={onChange} />)

    fireEvent.click(screen.getAllByRole('button')[0])
    fireEvent.click(screen.getByRole('button', { name: /next month/i }))
    fireEvent.click(screen.getByRole('button', { name: /15 de dezembro de 2026/i }))

    expect(onChange).toHaveBeenCalledOnce()
    expect(toCivilDate(onChange.mock.calls[0][0])).toBe('2026-12-15')
  })

  it('preserva o período ao focar e desfocar sem editar', () => {
    const onChange = vi.fn()
    const { container } = render(
      <DateRangePicker
        value={{ from: new Date(2026, 9, 12), to: new Date(2026, 9, 13) }}
        onChange={onChange}
      />,
    )

    const buttons = container.querySelectorAll('button')
    fireEvent.click(buttons[buttons.length - 1])
    fireEvent.blur(screen.getByPlaceholderText('DD/MM/YYYY - DD/MM/YYYY'))

    expect(onChange).not.toHaveBeenCalled()
  })
})
