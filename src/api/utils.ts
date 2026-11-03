import type { AxiosError } from 'axios'
import axios from 'axios'
import { ApiClientError } from './api-client.error'
import type { ApiErrorPayload } from './error-catalog.types'

export const isAxiosError = (error: unknown): error is AxiosError<ApiErrorPayload> => {
  return axios.isAxiosError(error)
}

export const getHeaders = (): Record<string, string> => {
  return {}
}

const isTransportErrorMessage = (message: string): boolean =>
  /^(network error|failed to fetch|load failed)$/i.test(message.trim())

const safeErrorMessage = (message: string | undefined, defaultMessage: string): string =>
  message && !isTransportErrorMessage(message) ? message : defaultMessage

export const extractErrorMessage = (error: unknown, defaultMessage: string) => {
  if (error instanceof ApiClientError) return safeErrorMessage(error.message, defaultMessage)

  if (isAxiosError(error)) {
    return safeErrorMessage(
      error.response?.data.message || error.response?.data.error || error.message,
      defaultMessage,
    )
  }

  if (error instanceof Error) {
    return safeErrorMessage(error.message, defaultMessage)
  }

  return defaultMessage
}
