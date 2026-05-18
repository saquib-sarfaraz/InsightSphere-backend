import bcrypt from 'bcryptjs'
import { ApiError } from '../middleware/error.middleware.js'
import { HttpStatus } from '../constants/http-status.js'
import { User } from '../models/user.model.js'
import { Settings } from '../models/settings.model.js'
import { sha256, randomToken } from '../utils/crypto.js'
import { issueAuthTokens } from './token.service.js'
import { verifyRefreshToken } from '../utils/jwt.js'
import { sendEmail } from './email.service.js'
import { env } from '../config/env.js'
import { ensureOnboardingData } from './onboarding.service.js'
import { ActivityLog } from '../models/activity-log.model.js'

const SALT_ROUNDS = 12

export async function register({ name, email, password }) {
  const exists = await User.findOne({ email }).lean()
  if (exists) throw new ApiError(HttpStatus.CONFLICT, 'Email already in use', 'EMAIL_TAKEN')

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await User.create({ name, email, passwordHash })
  await Settings.create({ userId: user._id })

  const { token } = await createEmailVerificationToken(user._id)
  await sendEmailVerification(email, token)

  await ensureOnboardingData({ userId: user._id, userName: user.name })

  return user
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash +refreshTokenHash').exec()
  if (!user) throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid credentials', 'INVALID_CREDENTIALS')

  const ok = await user.verifyPassword(password)
  if (!ok) throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid credentials', 'INVALID_CREDENTIALS')

  user.lastLoginAt = new Date()
  const tokens = issueAuthTokens(user)

  // Store a hash of refresh token for rotation/revocation
  user.refreshTokenHash = sha256(tokens.refreshToken)
  user.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  await user.save()

  await ensureOnboardingData({ userId: user._id, userName: user.name })
  await ActivityLog.create({ userId: user._id, action: 'auth.login', entity: 'Session', entityId: 'Web' })

  return { user, tokens }
}

export async function refresh(refreshToken) {
  if (!refreshToken) throw new ApiError(HttpStatus.UNAUTHORIZED, 'Missing refresh token', 'MISSING_REFRESH')
  let decoded
  try {
    decoded = verifyRefreshToken(refreshToken)
  } catch {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid refresh token', 'INVALID_REFRESH')
  }
  const user = await User.findById(decoded.sub).select('+refreshTokenHash').exec()
  if (!user || !user.refreshTokenHash) throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid refresh token', 'INVALID_REFRESH')

  if (sha256(refreshToken) !== user.refreshTokenHash) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, 'Refresh token revoked', 'REVOKED_REFRESH')
  }

  const tokens = issueAuthTokens(user)
  user.refreshTokenHash = sha256(tokens.refreshToken)
  user.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  await user.save()

  return { user, tokens }
}

export async function logout(userId) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1, refreshTokenExpiresAt: 1 } })
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email }).select('+passwordResetTokenHash').exec()
  if (!user) return

  const raw = randomToken(24)
  user.passwordResetTokenHash = sha256(raw)
  user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
  await user.save()

  const resetUrl = `${env.APP_BASE_URL}/reset-password?token=${raw}`
  await sendEmail({
    to: email,
    subject: 'Reset your InsightSphere password',
    html: `<p>Reset link (valid 1h): <a href="${resetUrl}">${resetUrl}</a></p>`,
  })
}

export async function resetPassword({ token, newPassword }) {
  const tokenHash = sha256(token)
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).exec()
  if (!user) throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid or expired token', 'INVALID_RESET_TOKEN')

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
  user.passwordResetTokenHash = undefined
  user.passwordResetExpiresAt = undefined
  user.refreshTokenHash = undefined
  user.refreshTokenExpiresAt = undefined
  await user.save()
}

export async function createEmailVerificationToken(userId) {
  const raw = randomToken(20)
  const tokenHash = sha256(raw)
  await User.findByIdAndUpdate(userId, {
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })
  return { token: raw }
}

export async function verifyEmail(token) {
  const tokenHash = sha256(token)
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: { $gt: new Date() },
  }).exec()
  if (!user) throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid or expired token', 'INVALID_VERIFY_TOKEN')
  user.isEmailVerified = true
  user.emailVerificationTokenHash = undefined
  user.emailVerificationExpiresAt = undefined
  await user.save()
}

async function sendEmailVerification(email, token) {
  const url = `${env.APP_BASE_URL}/verify-email?token=${token}`
  await sendEmail({
    to: email,
    subject: 'Verify your InsightSphere email',
    html: `<p>Verify your email: <a href="${url}">${url}</a></p>`,
  })
}
