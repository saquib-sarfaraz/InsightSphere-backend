import { z } from 'zod'

export const updateSettingsSchema = z.object({
  body: z
    .object({
      profile: z
        .object({
          displayName: z.string().max(80).optional(),
          timezone: z.string().max(80).optional(),
        })
        .optional(),
      theme: z
        .object({
          mode: z.enum(['light', 'dark', 'system']).optional(),
        })
        .optional(),
      notifications: z
        .object({
          product: z.boolean().optional(),
          alerts: z.boolean().optional(),
          mentions: z.boolean().optional(),
        })
        .optional(),
      security: z
        .object({
          twoFactorEnabled: z.boolean().optional(),
        })
        .optional(),
    })
    .strict(),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
})

