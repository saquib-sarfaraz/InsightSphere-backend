import { env } from '../config/env.js'
import { signAccessToken, signRefreshToken } from '../utils/jwt.js'

export function issueAuthTokens(user) {
  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role })
  const refreshToken = signRefreshToken({ sub: user._id.toString(), type: 'refresh' })
  return { accessToken, refreshToken, expiresIn: env.JWT_ACCESS_EXPIRES_IN }
}

