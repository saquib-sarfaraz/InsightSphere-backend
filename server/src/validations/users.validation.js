import { z } from 'zod'
import { RoleList } from '../constants/roles.js'

export const listUsersSchema = z.object({
  query: z
    .object({
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
      role: z.enum(['all', ...RoleList]).optional(),
      status: z.enum(['all', 'active', 'invited', 'suspended']).optional(),
    })
    .passthrough(),
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
})

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z
    .object({
      name: z.string().min(2).optional(),
      role: z.enum(RoleList).optional(),
      status: z.enum(['active', 'invited', 'suspended']).optional(),
    })
    .strict(),
  query: z.object({}).passthrough(),
})

