import { z } from 'zod'

export const listNotificationsSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
      unread: z.preprocess(
        (v) => (v === 'true' || v === true ? true : v === 'false' || v === false ? false : v),
        z.boolean().optional(),
      ),
    })
    .passthrough(),
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
})

export const markReadSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
})
