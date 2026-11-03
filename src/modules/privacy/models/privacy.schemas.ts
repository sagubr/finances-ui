import { pageSchema, publicIdSchema } from '@/api/contract.schemas'
import { z } from 'zod'
import type { AccessLog, LegalDocument, Page, PrivacyRequest } from './privacy.types'
export const legalDocumentSchema = z.object({
  id: publicIdSchema,
  kind: z.string(),
  version: z.string(),
  title: z.string(),
  contentUri: z.string(),
  effectiveAt: z.string().datetime(),
}) satisfies z.ZodType<LegalDocument>
export const privacyRequestSchema = z.object({
  id: publicIdSchema,
  requestId: publicIdSchema,
  status: z.enum(['REQUESTED', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED', 'FAILED']),
  encrypted: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  executeAfter: z.string().datetime().optional(),
}) satisfies z.ZodType<PrivacyRequest>
export const accessLogSchema = z.object({
  id: publicIdSchema,
  actorType: z.string(),
  action: z.string(),
  purpose: z.string(),
  resourceType: z.string(),
  requestId: z.string(),
  occurredAt: z.string().datetime(),
}) satisfies z.ZodType<AccessLog>
export const documentListSchema = z.object({ items: z.array(legalDocumentSchema) })
export const accessLogPageSchema = pageSchema(accessLogSchema) satisfies z.ZodType<Page<AccessLog>>
