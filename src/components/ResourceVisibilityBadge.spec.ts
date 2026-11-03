import { describe, expect, it } from 'vitest'
import {
  getResourceVisibilityActionLabel,
  getResourceVisibilityLabel,
} from './ResourceVisibilityBadge'

describe('resource visibility language', () => {
  it('usa a mesma terminologia para qualquer recurso', () => {
    expect(getResourceVisibilityLabel(true)).toBe('Compartilhado')
    expect(getResourceVisibilityLabel(false)).toBe('Privado')
    expect(getResourceVisibilityActionLabel(true)).toBe('Tornar privado')
    expect(getResourceVisibilityActionLabel(false)).toBe('Compartilhar')
  })
})
