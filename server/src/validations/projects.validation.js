import { z } from 'zod'

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z.enum(['planned', 'in_progress', 'review', 'done']).optional(),
  }),
})

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().min(10).max(500).optional().default(''),
    status: z.enum(['planned', 'in_progress', 'review', 'done']).optional().default('planned'),
    tags: z.array(z.string().min(1)).max(8).optional().default([]),
  }),
})
