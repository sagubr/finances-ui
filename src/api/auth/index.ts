import apiClient, { clearCsrfToken } from '@/api/client'
import {
  acceptedRequestSchema,
  confirmedEmailSchema,
  registeredUserSchema,
  sessionSchema,
} from './auth.schemas'
import type { SessionResponse } from './type'

export const validateUserToken = async (): Promise<SessionResponse> => {
  const response = await apiClient.get<SessionResponse>('/auth/session')
  return sessionSchema.parse(response.data)
}

export const registerUser = async (input: {
  email: string
  displayName: string
  password: string
}) => registeredUserSchema.parse((await apiClient.post('/auth/register', input)).data)

export const confirmEmail = async (token: string) =>
  confirmedEmailSchema.parse((await apiClient.post('/auth/email/confirm', { token })).data)

export const resendConfirmation = async (email: string) =>
  acceptedRequestSchema.parse((await apiClient.post('/auth/email/resend', { email })).data)

export const authenticateUser = async (input: { email: string; password: string }) => {
  await apiClient.post('/auth/login', input)
  return validateUserToken()
}

export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout')
  } finally {
    clearCsrfToken()
  }
}

export const recoverPassword = async (email: string): Promise<void> => {
  await apiClient.post('/auth/password/forgot', { email })
}

export const resetPassword = async (input: { token: string; password: string }): Promise<void> => {
  await apiClient.post('/auth/password/reset', input)
}

export const changePassword = async (input: {
  currentPassword: string
  password: string
}): Promise<void> => {
  await apiClient.post('/auth/password/change', input)
}
