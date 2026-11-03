import apiClient from '@/api/client'
import {
  activityPageSchema,
  activitySchema,
  goalPageSchema,
  goalSchema,
  notificationPageSchema,
  wishlistItemSchema,
  wishlistPageSchema,
} from '../models/organization.schemas'
import type { Activity, Goal, Notification, Page, WishlistItem } from '../models/organization.types'
const idempotency = () => ({ 'idempotency-key': crypto.randomUUID() })
export const organizationApi = {
  activities: async (): Promise<Page<Activity>> =>
    activityPageSchema.parse(
      (await apiClient.get('/planner/activities', { params: { limit: 200 } })).data,
    ),
  createActivity: async (input: { name: string; color?: string }): Promise<Activity> =>
    activitySchema.parse(
      (await apiClient.post('/planner/activities', input, { headers: idempotency() })).data,
    ),
  updateActivity: async (
    activity: Activity,
    input: { name: string; color?: string },
  ): Promise<Activity> =>
    activitySchema.parse(
      (
        await apiClient.patch(`/planner/activities/${activity.id}`, {
          ...input,
          expectedVersion: activity.version,
        })
      ).data,
    ),
  removeActivity: async (activity: Activity): Promise<void> => {
    await apiClient.delete(`/planner/activities/${activity.id}`, {
      data: { expectedVersion: activity.version },
    })
  },
  goals: async (): Promise<Page<Goal>> =>
    goalPageSchema.parse((await apiClient.get('/goals', { params: { limit: 200 } })).data),
  createGoal: async (input: {
    name: string
    type: Goal['type']
    targetValue: string
    unit: string
    startsOn: string
  }): Promise<Goal> =>
    goalSchema.parse((await apiClient.post('/goals', input, { headers: idempotency() })).data),
  updateGoal: async (
    goal: Goal,
    input: { name: string; targetValue: string; unit: string },
  ): Promise<Goal> =>
    goalSchema.parse(
      (
        await apiClient.patch(`/goals/${goal.id}`, {
          ...input,
          type: goal.type,
          startsOn: goal.startsOn,
          dueOn: goal.dueOn ?? undefined,
          expectedVersion: goal.version,
        })
      ).data,
    ),
  removeGoal: async (goal: Goal): Promise<void> => {
    await apiClient.delete(`/goals/${goal.id}`, {
      data: { expectedVersion: goal.version },
    })
  },
  wishlist: async (): Promise<Page<WishlistItem>> =>
    wishlistPageSchema.parse((await apiClient.get('/wishlist', { params: { limit: 200 } })).data),
  createWishlistItem: async (input: {
    name: string
    estimatedPriceCents?: number
    currency: string
    priority: number
  }): Promise<WishlistItem> =>
    wishlistItemSchema.parse(
      (await apiClient.post('/wishlist', input, { headers: idempotency() })).data,
    ),
  updateWishlistItem: async (
    item: WishlistItem,
    input: { name: string; estimatedPriceCents?: number; currency: string; priority: number },
  ): Promise<WishlistItem> =>
    wishlistItemSchema.parse(
      (
        await apiClient.patch(`/wishlist/${item.id}`, {
          ...input,
          url: item.url ?? undefined,
          expectedVersion: item.version,
        })
      ).data,
    ),
  removeWishlistItem: async (item: WishlistItem): Promise<void> => {
    await apiClient.delete(`/wishlist/${item.id}`, {
      data: { expectedVersion: item.version },
    })
  },
  notifications: async (): Promise<Page<Notification>> =>
    notificationPageSchema.parse(
      (await apiClient.get('/notifications', { params: { limit: 100 } })).data,
    ),
  readNotification: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`, {})
  },
  readAllNotifications: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all', {})
  },
}
