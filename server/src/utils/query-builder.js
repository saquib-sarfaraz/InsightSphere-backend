// Builds Mongo queries for common SaaS dashboard list endpoints
export function buildSearchQuery({ search, fields = [] }) {
  if (!search?.trim()) return null
  const q = search.trim()
  return {
    $or: fields.map((f) => ({ [f]: { $regex: q, $options: 'i' } })),
  }
}

