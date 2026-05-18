import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
})

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
})

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    newPassword: z.string().min(6),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
})

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(10),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
})

