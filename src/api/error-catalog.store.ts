import type { ErrorDocumentation } from './error-catalog.types'

const catalogByCode = new Map<string, ErrorDocumentation>()

export const installErrorCatalog = (entries: readonly ErrorDocumentation[]): void => {
  catalogByCode.clear()
  entries.forEach((entry) => catalogByCode.set(entry.code, entry))
}

export const findErrorDocumentation = (code?: string): ErrorDocumentation | undefined =>
  code ? catalogByCode.get(code) : undefined

export const clearErrorCatalog = (): void => {
  catalogByCode.clear()
}
