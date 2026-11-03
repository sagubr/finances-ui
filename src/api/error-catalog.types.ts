export interface ErrorDocumentation {
  readonly code: string
  readonly statusCode: number
  readonly module: string
  readonly translationKey: string
  readonly description: string
  readonly resolution: string
}

export interface ApiErrorPayload {
  readonly message?: string
  readonly error?: string
  readonly code?: string
  readonly details?: unknown
  readonly data?: {
    readonly code?: string
    readonly details?: unknown
    readonly requestId?: string
  }
}
