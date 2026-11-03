export type LegalDocument = {
  id: string
  kind: string
  version: string
  title: string
  contentUri: string
  effectiveAt: string
}
export type PrivacyRequest = {
  id: string
  requestId: string
  status: 'REQUESTED' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'FAILED'
  encrypted?: boolean
  expiresAt?: string | null
  executeAfter?: string
}
export type AccessLog = {
  id: string
  actorType: string
  action: string
  purpose: string
  resourceType: string
  requestId: string
  occurredAt: string
}
export type Page<T> = { items: T[]; pageInfo: { nextCursor: string | null; hasNextPage: boolean } }
