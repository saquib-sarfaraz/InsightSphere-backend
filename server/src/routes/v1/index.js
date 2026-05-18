import { Router } from 'express'
import { router as auth } from './auth.routes.js'
import { router as users } from './users.routes.js'
import { router as analytics } from './analytics.routes.js'
import { router as filters } from './filters.routes.js'
import { router as notifications } from './notifications.routes.js'
import { router as settings } from './settings.routes.js'
import { router as projects } from './projects.routes.js'

export const apiV1Router = Router()

apiV1Router.use('/auth', auth)
apiV1Router.use('/users', users)
apiV1Router.use('/analytics', analytics)
apiV1Router.use('/filters', filters)
apiV1Router.use('/notifications', notifications)
apiV1Router.use('/settings', settings)
apiV1Router.use('/projects', projects)
