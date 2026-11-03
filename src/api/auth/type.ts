export type SessionResponse = Readonly<{
  id: string
  user: Readonly<{
    id: string
    email: string
    displayName: string
    emailConfirmed: boolean
  }>
  expiresAt: string
}>
