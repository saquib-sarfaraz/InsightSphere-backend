import { asyncHandler } from '../utils/async-handler.js'
import { ok } from '../utils/api-response.js'
import * as notificationsService from '../services/notifications.service.js'

export const listMyNotifications = asyncHandler(async (req, res) => {
  const { items, meta } = await notificationsService.listMyNotifications(
    req.user._id,
    req.validated.query,
  )
  return ok(res, { data: items, meta })
})

export const markRead = asyncHandler(async (req, res) => {
  const n = await notificationsService.markRead(req.user._id, req.params.id)
  return ok(res, { message: 'Marked as read', data: n })
})

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationsService.markAllRead(req.user._id)
  return ok(res, { message: 'All marked as read' })
})

