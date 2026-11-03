import apiClient from './client'
import { installErrorCatalog } from './error-catalog.store'
import type { ErrorDocumentation } from './error-catalog.types'

const catalogInitialization = apiClient
  .get<ErrorDocumentation[]>('/meta/errors')
  .then(({ data }) => installErrorCatalog(data))
  .catch(() => undefined)

export const initializeErrorCatalog = (): Promise<void> => catalogInitialization
