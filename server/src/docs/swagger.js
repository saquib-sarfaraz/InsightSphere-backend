import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import { env } from '../config/env.js'

const spec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'InsightSphere API',
      version: '1.0.0',
      description: 'Production-grade SaaS analytics backend (Express + MongoDB).',
    },
    servers: [{ url: `http://localhost:${env.PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['server/src/routes/v1/*.js'],
})

export const swaggerRouter = Router()
swaggerRouter.use('/', swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }))
