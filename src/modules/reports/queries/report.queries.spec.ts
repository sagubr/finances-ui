import { describe, expect, it } from 'vitest'
import { monthlyCalendarQuery, reportKeys } from './report.queries'

describe('reportKeys', () => {
  it('isola o cache por workspace', () => {
    expect(reportKeys.root('workspace-a')).toEqual(['reports', 'workspace-a'])
    expect(reportKeys.root('workspace-a')).not.toEqual(reportKeys.root('workspace-b'))
  })

  it('chaveia o calendário por workspace e competência', () => {
    const query = monthlyCalendarQuery('2026-11')

    expect(query.queryKey).toEqual([...reportKeys.root(), 'monthly-calendar', '2026-11'])
    expect(query.staleTime).toBe(60_000)
  })
})
