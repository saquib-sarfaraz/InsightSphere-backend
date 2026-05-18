import { Notification } from '../models/notification.model.js'
import { parsePagination } from '../utils/pagination.js'
import { ApiError } from '../middleware/error.middleware.js'
import { HttpStatus } from '../constants/http-status.js'

export async function listMyNotifications(userId, query) {
  const { page, limit, skip } = parsePagination(query, { page: 1, limit: 20 })
  const filters = { userId }
  if (query.unread === true) filters.readAt = null
  if (query.unread === false) filters.readAt = { $ne: null }

  const [items, total] = await Promise.all([
    Notification.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filters),
  ])

  return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 } }
}

export async function markRead(userId, id) {
  const n = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { readAt: new Date() },
    { new: true },
  ).lean()
  if (!n) throw new ApiError(HttpStatus.NOT_FOUND, 'Notification not found', 'NOTIFICATION_NOT_FOUND')
  return n
}

export async function markAllRead(userId) {
  await Notification.updateMany({ userId, readAt: null }, { readAt: new Date() })
}
