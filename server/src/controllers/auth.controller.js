import { asyncHandler } from '../utils/async-handler.js'
import { ok } from '../utils/api-response.js'
import * as authService from '../services/auth.service.js'
import { clearAuthCookies, setAuthCookies } from '../utils/cookies.js'
import { HttpStatus } from '../constants/http-status.js'
import { logger } from '../logs/logger.js'

export const register = asyncHandler(async (req, res) => {
  logger.debug({ email: req.validated?.body?.email, name: req.validated?.body?.name }, 'auth.register request')
  const user = await authService.register(req.validated.body)
  logger.debug({ userId: user?._id?.toString?.(), email: user?.email }, 'auth.register created user')
  return res.status(HttpStatus.CREATED).json({
    success: true,
    message: 'Registered successfully. Please verify your email.',
    data: { user: sanitizeUser(user) },
  })
})

export const login = asyncHandler(async (req, res) => {
  logger.debug({ email: req.validated?.body?.email }, 'auth.login request')
  const { user, tokens } = await authService.login(req.validated.body)
  logger.debug({ userId: user?._id?.toString?.(), email: user?.email }, 'auth.login success')
  setAuthCookies(res, tokens)
  return ok(res, { message: 'Logged in', data: { user: sanitizeUser(user), tokens } })
})

export const refresh = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.substring(7)
      : undefined)
  const { user, tokens } = await authService.refresh(token)
  setAuthCookies(res, tokens)
  return ok(res, { message: 'Refreshed', data: { user: sanitizeUser(user), tokens } })
})

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id)
  clearAuthCookies(res)
  return ok(res, { message: 'Logged out' })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.validated.body.email)
  return ok(res, { message: 'If the email exists, a reset link has been sent.' })
})

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.validated.body)
  clearAuthCookies(res)
  return ok(res, { message: 'Password reset successful' })
})

export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.validated.body.token)
  return ok(res, { message: 'Email verified' })
})

export const me = asyncHandler(async (req, res) => {
  return ok(res, { data: { user: req.user } })
})

function sanitizeUser(user) {
  const u = user.toObject ? user.toObject() : user
  // Ensure we never return hashes/tokens
  delete u.passwordHash
  delete u.refreshTokenHash
  delete u.passwordResetTokenHash
  delete u.emailVerificationTokenHash
  return u
}
