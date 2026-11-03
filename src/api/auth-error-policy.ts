const SESSION_TERMINATING_AUTH_CODES = new Set(['AUTH_SSO_UNAVAILABLE'])

export const shouldTerminateSession = (status?: number, code?: string): boolean =>
  status === 401 || Boolean(code && SESSION_TERMINATING_AUTH_CODES.has(code))
