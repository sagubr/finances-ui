import type { ApiErrorPayload, ErrorDocumentation } from './error-catalog.types'

interface ApiClientErrorOptions {
  readonly message: string
  readonly status?: number
  readonly code?: string
  readonly details?: unknown
  readonly requestId?: string
  readonly documentation?: ErrorDocumentation
  readonly payload?: ApiErrorPayload
  readonly cause?: unknown
}

export class ApiClientError extends Error {
  readonly status?: number
  readonly code?: string
  readonly details?: unknown
  readonly requestId?: string
  readonly documentation?: ErrorDocumentation
  readonly payload?: ApiErrorPayload

  constructor(options: ApiClientErrorOptions) {
    super(options.message, { cause: options.cause })
    this.name = 'ApiClientError'
    this.status = options.status
    this.code = options.code
    this.details = options.details
    this.requestId = options.requestId
    this.documentation = options.documentation
    this.payload = options.payload
  }
}
