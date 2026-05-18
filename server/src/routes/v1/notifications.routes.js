import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { validate } from '../../middleware/validate.middleware.js'
import * as notificationsController from '../../controllers/notifications.controller.js'
import { listNotificationsSchema, markReadSchema } from '../../validations/notifications.validation.js'

export const router = Router()

router.use(requireAuth)

router.get('/', validate(listNotificationsSchema), notificationsController.listMyNotifications)
router.post('/read-all', notificationsController.markAllRead)
router.post('/:id/read', validate(markReadSchema), notificationsController.markRead)

