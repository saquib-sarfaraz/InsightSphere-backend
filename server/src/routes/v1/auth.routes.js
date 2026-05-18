import { Router } from 'express'
import { validate } from '../../middleware/validate.middleware.js'
import { authLimiter } from '../../middleware/rate-limit.middleware.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import * as authController from '../../controllers/auth.controller.js'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../../validations/auth.validation.js'

export const router = Router()

router.get('/me', requireAuth, authController.me)

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: Created }
 */
router.post('/register', authLimiter, validate(registerSchema), authController.register)

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', requireAuth, authController.logout)
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword)
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword)
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), authController.verifyEmail)
