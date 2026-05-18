import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8080),

  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((v) => v.split(',').map((s) => s.trim())),

  // Critical: required in all environments (dev/staging/prod)
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // Critical: required in all environments
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Critical: required in all environments
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 chars'),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.preprocess((v) => v === 'true' || v === true, z.boolean()).default(false),

  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().int().default(1200),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().default(20),

  APP_BASE_URL: z.string().default('http://localhost:5173'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('InsightSphere <no-reply@insightsphere.dev>'),

  REDIS_URL: z.string().optional(),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error(parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
