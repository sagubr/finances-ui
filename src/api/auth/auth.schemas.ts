import { publicIdSchema } from '@/api/contract.schemas'
import { z } from 'zod'
import type { SessionResponse } from './type'

export const registeredUserSchema = z.object({
  userId: publicIdSchema,
})
export const confirmedEmailSchema = z.object({ confirmed: z.literal(true) })
export const acceptedRequestSchema = z.object({ accepted: z.literal(true) })
export const sessionSchema = z.object({
  id: publicIdSchema,
  user: z.object({
    id: publicIdSchema,
    email: z.string().email(),
    displayName: z.string(),
    emailConfirmed: z.boolean(),
  }),
  expiresAt: z.string().datetime(),
}) satisfies z.ZodType<SessionResponse>
