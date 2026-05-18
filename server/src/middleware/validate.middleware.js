import { ApiError } from './error.middleware.js'
import { HttpStatus } from '../constants/http-status.js'

export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body || {},
      query: req.query || {},
      params: req.params || {},
    })
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }))
      return next(new ApiError(HttpStatus.BAD_REQUEST, 'Validation error', 'VALIDATION_ERROR', { issues }))
    }
    req.validated = result.data
    return next()
  }
}

