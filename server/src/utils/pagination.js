export function parsePagination(query, defaults = { page: 1, limit: 20 }) {
  const page = Math.max(1, Number(query.page || defaults.page))
  const limit = Math.min(100, Math.max(1, Number(query.limit || defaults.limit)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

