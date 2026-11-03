import { envConfig } from '@/config/env.config'
import { isAuthRoute } from '@/lib/auth-routes'
import { getActiveWorkspaceUuid } from '@/modules/workspaces/lib/workspace-selection'
import axios from 'axios'
import { ApiClientError } from './api-client.error'
import { shouldTerminateSession } from './auth-error-policy'
import { findErrorDocumentation } from './error-catalog.store'
import type { ApiErrorPayload } from './error-catalog.types'
import { unwrapSuccessEnvelope } from './response-envelope'
import { notifySessionExpired } from './session-lifecycle'

let csrfToken: string | null = null
let csrfRequest: Promise<string> | null = null

const getCsrfToken = (): Promise<string> => {
  if (csrfToken) return Promise.resolve(csrfToken)
  if (csrfRequest) return csrfRequest
  csrfRequest = apiClient
    .get<{ token: string }>('/auth/csrf', { headers: { accept: 'application/json' } })
    .then(({ data }) => {
      csrfToken = data.token
      return csrfToken
    })
    .finally(() => {
      csrfRequest = null
    })
  return csrfRequest
}

export const clearCsrfToken = () => {
  csrfToken = null
}

const mutationMethods = new Set(['post', 'put', 'patch', 'delete'])

export const apiClient = axios.create({
  baseURL: envConfig.apiV1Url,
  withCredentials: true,
  paramsSerializer: { indexes: null },
})

apiClient.interceptors.request.use(async (config) => {
  const workspaceUuid = getActiveWorkspaceUuid()
  config.headers.set('x-request-id', crypto.randomUUID())
  if (workspaceUuid) config.headers.set('x-workspace', workspaceUuid)
  if (mutationMethods.has(config.method?.toLowerCase() ?? ''))
    config.headers.set('x-csrf-token', await getCsrfToken())
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    if (response.status !== 204 && response.config.responseType !== 'blob')
      response.data = unwrapSuccessEnvelope(response.data)
    return response
  },
  (error) => {
    const payload = error.response?.data as ApiErrorPayload | undefined
    const code = payload?.data?.code ?? payload?.code

    if (shouldTerminateSession(error.response?.status, code)) {
      if (!isAuthRoute(window.location.pathname)) void notifySessionExpired()
    }

    const documentation = findErrorDocumentation(code)
    const message =
      payload?.message ||
      payload?.error ||
      documentation?.description ||
      error.message ||
      'Erro na comunicação com a API.'
    return Promise.reject(
      new ApiClientError({
        message,
        status: error.response?.status,
        code,
        details: payload?.data?.details ?? payload?.details,
        requestId: payload?.data?.requestId,
        documentation,
        payload,
        cause: error,
      }),
    )
  },
)

export default apiClient
