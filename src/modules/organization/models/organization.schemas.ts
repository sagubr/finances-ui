import {
  civilDateSchema,
  pageSchema,
  publicIdSchema,
  safeIntegerSchema,
} from '@/api/contract.schemas'
import { z } from 'zod'
import type {
  Activity,
  Goal,
  Notification,
  Page,
  WishlistItem,
  WishlistPurchase,
  WishlistSummary,
} from './organization.types'

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
  reason: z.string().nullable(),
  plannedOn: civilDateSchema.nullable(),
  status: z.enum(['PLANNED', 'PURCHASE_PENDING', 'PURCHASED', 'ARCHIVED']),
  actualPriceCents: safeIntegerSchema.nullable(),
  purchasedOn: civilDateSchema.nullable(),
  transactionId: publicIdSchema.nullable(),
  version: z.number().int().positive(),
}) satisfies z.ZodType<WishlistItem>
export const wishlistSummarySchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  totals: z.array(
    z.object({
      currency: z.string().length(3),
      totalCents: safeIntegerSchema.nonnegative(),
      itemCount: z.number().int().nonnegative(),
    }),
  ),
}) satisfies z.ZodType<WishlistSummary>
export const wishlistPurchaseSchema = z.object({
  itemId: publicIdSchema,
  transactionId: publicIdSchema.nullable(),
  repeated: z.boolean(),
}) satisfies z.ZodType<WishlistPurchase>
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
