import { ApiError } from './error.middleware.js'
import { HttpStatus } from '../constants/http-status.js'
import { verifyAccessToken } from '../utils/jwt.js'
import { User } from '../models/user.model.js'
import { Roles } from '../constants/roles.js'

export async function requireAuth(req, _res, next) {
  const header = req.headers.authorization
  const token =
    header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : req.cookies?.accessToken

  if (!token) {
    req.log?.debug?.({ hasAuthHeader: Boolean(header), hasCookie: Boolean(req.cookies?.accessToken) }, 'auth.missing_token')
    return next(new ApiError(HttpStatus.UNAUTHORIZED, 'Unauthorized', 'UNAUTHORIZED'))
  }

  try {
    const decoded = verifyAccessToken(token)
    const user = await User.findById(decoded.sub).lean()
    if (!user) return next(new ApiError(HttpStatus.UNAUTHORIZED, 'Unauthorized', 'UNAUTHORIZED'))
    if (user.status === 'suspended') {
      return next(new ApiError(HttpStatus.FORBIDDEN, 'Account suspended', 'SUSPENDED'))
    }
    req.user = user
    return next()
  } catch {
    req.log?.debug?.('auth.invalid_token')
    return next(new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid token', 'INVALID_TOKEN'))
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    const role = req.user?.role || Roles.USER
    if (!roles.includes(role)) {
      return next(new ApiError(HttpStatus.FORBIDDEN, 'Forbidden', 'FORBIDDEN'))
    }
    return next()
  }
}
