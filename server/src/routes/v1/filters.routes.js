import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import * as filtersController from '../../controllers/filters.controller.js'

export const router = Router()

router.use(requireAuth)

router.get('/topics', filtersController.topics)
router.get('/regions', filtersController.regions)
router.get('/sectors', filtersController.sectors)
router.get('/sources', filtersController.sources)
router.get('/countries', filtersController.countries)
router.get('/pestle', filtersController.pestle)

