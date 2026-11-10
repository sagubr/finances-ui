import { useMediaQuery } from './useMediaQuery'

export const MOBILE_BREAKPOINT = 768
export const DESKTOP_MEDIA_QUERY = `(min-width: ${MOBILE_BREAKPOINT}px)`

export function useIsMobile() {
  return !useMediaQuery(DESKTOP_MEDIA_QUERY, true)
}
