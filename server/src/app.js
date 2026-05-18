import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import compression from 'compression'
import { env } from './config/env.js'
import { requestLogger } from './logs/request-logger.js'
import { notFound, errorHandler } from './middleware/error.middleware.js'
import { mongoSanitizeMiddleware } from './middleware/mongo-sanitize.middleware.js'
import { apiV1Router } from './routes/v1/index.js'
import { swaggerRouter } from './docs/swagger.js'

export const app = express()

// If deployed behind a proxy (e.g. Render/Heroku/Nginx), trust `X-Forwarded-For`
app.set('trust proxy', env.TRUST_PROXY)

app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://insightsphere-sage.vercel.app',
      ]
      if (Array.isArray(env.CORS_ORIGIN)) {
        allowed.push(...env.CORS_ORIGIN)
      } else if (env.CORS_ORIGIN) {
        allowed.push(env.CORS_ORIGIN)
      }

      if (!origin || allowed.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-app-client'],
  }),
)
app.use(compression())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(env.COOKIE_SECRET))
app.use(mongoSanitizeMiddleware)
app.use(requestLogger)
if (env.NODE_ENV !== 'production') app.use(morgan('dev'))

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.RATE_LIMIT_GLOBAL_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})
app.use(globalLimiter)

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'insightsphere-backend', env: env.NODE_ENV })
})

app.use('/docs', swaggerRouter)
app.use('/api/v1', apiV1Router)

app.use(notFound)
app.use(errorHandler)
