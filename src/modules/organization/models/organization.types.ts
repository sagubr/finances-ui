export type Page<T> = { items: T[]; pageInfo: { nextCursor: string | null; hasNextPage: boolean } }
export type Activity = {
  id: string
  name: string
  color: string | null
  archivedAt: string | null
  version: number
}
export type Goal = {
  id: string
  name: string
  type: 'MANUAL' | 'COUNT' | 'AMOUNT_INVESTED' | 'NET_WORTH' | 'CATEGORY_LIMIT' | 'HABIT_HOURS'
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED'
  targetValue: string
  unit: string
  startsOn: string
  dueOn: string | null
  version: number
}
export type WishlistItem = {
  id: string
  name: string
  url: string | null
  estimatedPriceCents: number | null
  currency: string
  priority: number
  status: 'PLANNED' | 'PURCHASE_PENDING' | 'PURCHASED' | 'ARCHIVED'
  version: number
}
export type Notification = {
  id: string
  type: string
  title: string
  body: string
  readAt: string | null
  createdAt: string
}
