import { HttpStatus } from '../constants/http-status.js'
import { logger } from '../logs/logger.js'

export class ApiError extends Error {
  constructor(statusCode, message, code = 'API_ERROR', details = undefined) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export function notFound(req, res) {
  return res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found', path: req.originalUrl },
  })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err?.statusCode || 500
  const code = err?.code || 'INTERNAL_ERROR'

  if (status >= 500) logger.error({ err }, 'Unhandled error')

  return res.status(status).json({
    success: false,
    error: {
      code,
      message: err?.message || 'Unexpected error',
      ...(err?.details ? { details: err.details } : {}),
    },
  })
}
