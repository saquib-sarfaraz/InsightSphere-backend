import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { validate } from '../../middleware/validate.middleware.js'
import * as analyticsController from '../../controllers/analytics.controller.js'
import { listAnalyticsSchema } from '../../validations/analytics.validation.js'

export const router = Router()

router.use(requireAuth)

router.get('/overview', analyticsController.overview)

/**
 * @openapi
 * /api/v1/analytics:
 *   get:
 *     tags: [Analytics]
 *     summary: List analytics data
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: topic
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', validate(listAnalyticsSchema), analyticsController.list)
router.get('/intensity', analyticsController.intensity)
router.get('/relevance', analyticsController.relevance)
router.get('/likelihood', analyticsController.likelihood)
router.get('/country', analyticsController.country)
router.get('/topics', analyticsController.topics)
router.get('/region', analyticsController.region)
router.get('/year', analyticsController.year)
router.get('/source', analyticsController.source)
router.get('/sector', analyticsController.sector)
router.get('/pestle', analyticsController.pestle)
