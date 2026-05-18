import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { validate } from '../../middleware/validate.middleware.js'
import * as projectsController from '../../controllers/projects.controller.js'
import { createProjectSchema, listProjectsSchema } from '../../validations/projects.validation.js'

export const router = Router()

router.use(requireAuth)

router.get('/', validate(listProjectsSchema), projectsController.listMyProjects)
router.post('/', validate(createProjectSchema), projectsController.createMyProject)
