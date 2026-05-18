import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { validate } from '../../middleware/validate.middleware.js'
import * as settingsController from '../../controllers/settings.controller.js'
import { updateSettingsSchema } from '../../validations/settings.validation.js'

export const router = Router()

router.use(requireAuth)

router.get('/me', settingsController.getMySettings)
router.put('/me', validate(updateSettingsSchema), settingsController.updateMySettings)

