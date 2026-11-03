const AUTH_ROUTES = [
  '/login',
  '/register',
  '/confirm-email',
  '/resend-confirmation',
  '/reset-password',
]

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}
