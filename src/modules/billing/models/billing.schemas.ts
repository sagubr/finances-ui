import { publicIdSchema, safeIntegerSchema } from '@/api/contract.schemas'
import { z } from 'zod'
import type { Plan, Subscription, Usage } from './billing.types'
export const planSchema = z.object({
  id: publicIdSchema,
  code: z.string(),
  name: z.string(),
  versionId: publicIdSchema,
  version: z.number().int(),
  currency: z.string().length(3),
  priceCents: safeIntegerSchema.nonnegative(),
  entitlements: z.unknown(),
}) satisfies z.ZodType<Plan>
export const subscriptionSchema = z.object({
  id: publicIdSchema,
  status: z.enum(['TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED']),
  currentPeriodEnd: z.string().datetime().nullable(),
  code: z.string(),
  name: z.string(),
  entitlements: z.unknown(),
}) satisfies z.ZodType<Subscription>
export const planListSchema = z.object({ items: z.array(planSchema) })
export const usageSchema = z.object({
  items: z.array(
    z.object({
      key: z.string(),
      period: z.string(),
      value: z.number().int().nonnegative(),
      updatedAt: z.string().datetime(),
    }),
  ),
}) satisfies z.ZodType<Usage>
