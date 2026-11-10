import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Calendar } from './calendar'

describe('Calendar', () => {
  it('preserva classes estruturais fornecidas pelo consumidor', () => {
    const { container } = render(
      <Calendar
        month={new Date(2026, 10, 1)}
        classNames={{
          month_grid: 'calendar-wide-grid',
          weekdays: 'calendar-wide-weekdays',
          week: 'calendar-wide-week',
        }}
      />,
    )

    expect(container.querySelector('.calendar-wide-grid')).not.toBeNull()
    expect(container.querySelector('.calendar-wide-weekdays')).not.toBeNull()
    expect(container.querySelector('.calendar-wide-week')).not.toBeNull()
  })
})
