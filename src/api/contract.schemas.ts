import { z } from 'zod'

const uuidV7Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const publicIdSchema = z.string().regex(uuidV7Pattern, 'Expected a UUIDv7 identifier.')
export const civilDateSchema = z.string().refine((value) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}, 'Expected a valid YYYY-MM-DD date.')
export const competenceMonthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)
export const safeIntegerSchema = z.number().int().safe()
export const pageInfoSchema = z.object({
  nextCursor: z.string().nullable(),
  hasNextPage: z.boolean(),
})
export const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({ items: z.array(item), pageInfo: pageInfoSchema })
