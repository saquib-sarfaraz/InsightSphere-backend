import { z } from 'zod'

export const listAnalyticsSchema = z.object({
  query: z
    .object({
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
      end_year: z.string().optional(),
      start_year: z.string().optional(),
      topic: z.string().optional(),
      sector: z.string().optional(),
      region: z.string().optional(),
      source: z.string().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      pestle: z.string().optional(),
    })
    .passthrough(),
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
})

