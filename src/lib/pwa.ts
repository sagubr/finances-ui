import { registerSW } from 'virtual:pwa-register'

const RELOAD_KEY = 'pwa_preload_error_timestamp'
const RELOAD_COOLDOWN_MS = 10_000
const UPDATE_INTERVAL_MS = 15 * 60 * 1000

const state = { initialized: false }

/**
 * Safe wrapper around `sessionStorage`.
 * In private browsing or with storage policies disabled, access may throw.
 */
const safeSessionStorage = (): Storage | null => {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

const handlePreloadError = (): void => {
  const storage = safeSessionStorage()

  // Without storage we cannot guard against reload loops, so do not reload.
  if (!storage) return

  try {
    const lastReload = Number(storage.getItem(RELOAD_KEY) ?? 0)
    const now = Date.now()

    // Prevent infinite reload loops
    if (now - lastReload > RELOAD_COOLDOWN_MS) {
      storage.setItem(RELOAD_KEY, String(now))
      window.location.reload()
    }
  } catch {
    // getItem/setItem can throw (quota, blocked storage); skip reload to avoid loops
  }
}

export const initializePwa = (): void => {
  if (state.initialized || typeof window === 'undefined') return
  state.initialized = true

  // Auto-reload once if dynamic import of a lazy chunk fails after a new deployment.
  window.addEventListener('vite:preloadError', handlePreloadError)

  // With registerType: 'autoUpdate' + skipWaiting + clientsClaim in the Workbox config,
  // the new SW activates immediately. We only need to wire up periodic update checks.
  if ('serviceWorker' in navigator) {
    registerSW({
      immediate: true,
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return

        // Poll for SW updates every 15 minutes
        setInterval(() => {
          void registration.update()
        }, UPDATE_INTERVAL_MS)

        // Also check when the user returns to this tab
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            void registration.update()
          }
        })
      },
    })
  }
}
