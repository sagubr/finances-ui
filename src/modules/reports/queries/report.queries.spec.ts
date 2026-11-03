import { describe, expect, it } from 'vitest'
import { reportKeys } from './report.queries'

describe('reportKeys', () => {
  it('isola o cache por workspace', () => {
    expect(reportKeys.root('workspace-a')).toEqual(['reports', 'workspace-a'])
    expect(reportKeys.root('workspace-a')).not.toEqual(reportKeys.root('workspace-b'))
  })
})
