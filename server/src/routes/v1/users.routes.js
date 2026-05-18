import { Router } from 'express'
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js'
import { validate } from '../../middleware/validate.middleware.js'
import * as usersController from '../../controllers/users.controller.js'
import { listUsersSchema, updateUserSchema } from '../../validations/users.validation.js'

export const router = Router()

router.use(requireAuth)

router.get('/me', usersController.me)
router.get('/team', usersController.team)

router.get('/', requireRole('admin'), validate(listUsersSchema), usersController.listUsers)
router.get('/:id', requireRole('admin'), usersController.getUser)
router.put('/:id', validate(updateUserSchema), usersController.updateUser)
router.delete('/:id', requireRole('admin'), usersController.deleteUser)
