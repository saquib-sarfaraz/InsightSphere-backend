const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

function shouldRemoveKey(key) {
  if (FORBIDDEN_KEYS.has(key)) return true
  return key.startsWith('$') || key.includes('.')
}

function sanitizeInPlace(value) {
  if (!value || typeof value !== 'object') return

  if (Array.isArray(value)) {
    for (const item of value) sanitizeInPlace(item)
    return
  }

for (const key of Object.keys(value)) {
    if (shouldRemoveKey(key)) {
      delete value[key]
      continue
    }
    sanitizeInPlace(value[key])
  }
}

export function mongoSanitizeMiddleware(req, _res, next) {
  sanitizeInPlace(req.body)
  sanitizeInPlace(req.params)
  sanitizeInPlace(req.query)
  next()
}

