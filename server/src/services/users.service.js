import { ApiError } from '../middleware/error.middleware.js'
import { HttpStatus } from '../constants/http-status.js'
import { User } from '../models/user.model.js'
import { parsePagination } from '../utils/pagination.js'
import { buildSearchQuery } from '../utils/query-builder.js'

export async function listUsers({ query }) {
  const { page, limit, skip } = parsePagination(query, { page: 1, limit: 20 })

  const filters = {}
  if (query.role && query.role !== 'all') filters.role = query.role
  if (query.status && query.status !== 'all') filters.status = query.status

  const search = buildSearchQuery({
    search: query.search,
    fields: ['name', 'email'],
  })
  const mongoQuery = search ? { ...filters, ...search } : filters

  const [items, total] = await Promise.all([
    User.find(mongoQuery).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(mongoQuery),
  ])

  return {
    items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  }
}

export async function getUser(id) {
  const user = await User.findById(id).lean()
  if (!user) throw new ApiError(HttpStatus.NOT_FOUND, 'User not found', 'USER_NOT_FOUND')
  return user
}

export async function updateUser(id, patch) {
  const user = await User.findByIdAndUpdate(id, patch, { new: true }).lean()
  if (!user) throw new ApiError(HttpStatus.NOT_FOUND, 'User not found', 'USER_NOT_FOUND')
  return user
}

export async function deleteUser(id) {
  const user = await User.findByIdAndDelete(id).lean()
  if (!user) throw new ApiError(HttpStatus.NOT_FOUND, 'User not found', 'USER_NOT_FOUND')
}

export async function listTeam(selfId) {
  const users = await User.find({ _id: { $ne: selfId } }).sort({ createdAt: -1 }).limit(6).lean()
  return users.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  }))
}
