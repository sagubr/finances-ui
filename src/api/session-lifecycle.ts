type SessionExpiredHandler = (saveRedirect?: boolean) => Promise<void>

let sessionExpiredHandler: SessionExpiredHandler | null = null

export const registerSessionExpiredHandler = (handler: SessionExpiredHandler) => {
  sessionExpiredHandler = handler
  return () => {
    if (sessionExpiredHandler === handler) sessionExpiredHandler = null
  }
}

export const notifySessionExpired = (): Promise<void> =>
  sessionExpiredHandler?.(true) ?? Promise.resolve()
