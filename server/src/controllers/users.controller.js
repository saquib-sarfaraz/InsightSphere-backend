import { asyncHandler } from '../utils/async-handler.js'
import { ok } from '../utils/api-response.js'
import * as usersService from '../services/users.service.js'
import { ApiError } from '../middleware/error.middleware.js'
import { HttpStatus } from '../constants/http-status.js'

export const listUsers = asyncHandler(async (req, res) => {
  const result = await usersService.listUsers({ query: req.validated.query })
  return ok(res, { data: result.items, meta: result.meta })
})

export const getUser = asyncHandler(async (req, res) => {
  const user = await usersService.getUser(req.params.id)
  return ok(res, { data: user })
})

export const updateUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id
  const isSelf = req.user?._id?.toString() === targetId
  const isAdmin = req.user?.role === 'admin'

  // Only admins can change role/status; users can change their own name
  if (!isAdmin) {
    if (!isSelf) throw new ApiError(HttpStatus.FORBIDDEN, 'Forbidden', 'FORBIDDEN')
    const allowed = { name: req.validated.body.name }
    const user = await usersService.updateUser(targetId, allowed)
    return ok(res, { message: 'Updated', data: user })
  }

  const user = await usersService.updateUser(targetId, req.validated.body)
  return ok(res, { message: 'Updated', data: user })
})

export const deleteUser = asyncHandler(async (req, res) => {
  await usersService.deleteUser(req.params.id)
  return ok(res, { message: 'Deleted' })
})

export const me = asyncHandler(async (req, res) => {
  const user = await usersService.getUser(req.user._id)
  return ok(res, { data: user })
})

export const team = asyncHandler(async (req, res) => {
  const items = await usersService.listTeam(req.user._id)
  return ok(res, { data: items })
})
