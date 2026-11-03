import {
  civilDateSchema,
  pageSchema,
  publicIdSchema,
  safeIntegerSchema,
} from '@/api/contract.schemas'
import { z } from 'zod'
import type { Activity, Goal, Notification, Page, WishlistItem } from './organization.types'

export const activitySchema = z.object({
  id: publicIdSchema,
  name: z.string(),
  color: z.string().nullable(),
  archivedAt: z.string().datetime().nullable(),
  version: z.number().int().positive(),
}) satisfies z.ZodType<Activity>
export const goalSchema = z.object({
  id: publicIdSchema,
  name: z.string(),
  type: z.enum([
    'MANUAL',
    'COUNT',
    'AMOUNT_INVESTED',
    'NET_WORTH',
    'CATEGORY_LIMIT',
    'HABIT_HOURS',
  ]),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'ARCHIVED']),
  targetValue: z.string(),
  unit: z.string(),
  startsOn: civilDateSchema,
  dueOn: civilDateSchema.nullable(),
  version: z.number().int().positive(),
}) satisfies z.ZodType<Goal>
export const wishlistItemSchema = z.object({
  id: publicIdSchema,
  name: z.string(),
  url: z.string().nullable(),
  estimatedPriceCents: safeIntegerSchema.nullable(),
  currency: z.string().length(3),
  priority: z.number().int(),
  status: z.enum(['PLANNED', 'PURCHASE_PENDING', 'PURCHASED', 'ARCHIVED']),
  version: z.number().int().positive(),
}) satisfies z.ZodType<WishlistItem>
export const notificationSchema = z.object({
  id: publicIdSchema,
  type: z.string(),
  title: z.string(),
  body: z.string(),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
}) satisfies z.ZodType<Notification>
export const activityPageSchema = pageSchema(activitySchema) satisfies z.ZodType<Page<Activity>>
export const goalPageSchema = pageSchema(goalSchema) satisfies z.ZodType<Page<Goal>>
export const wishlistPageSchema = pageSchema(wishlistItemSchema) satisfies z.ZodType<
  Page<WishlistItem>
>
export const notificationPageSchema = pageSchema(notificationSchema) satisfies z.ZodType<
  Page<Notification>
>
