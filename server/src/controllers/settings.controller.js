import { asyncHandler } from '../utils/async-handler.js'
import { ok } from '../utils/api-response.js'
import * as settingsService from '../services/settings.service.js'

export const getMySettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getMySettings(req.user._id)
  return ok(res, { data: settings })
})

export const updateMySettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateMySettings(req.user._id, req.validated.body)
  return ok(res, { message: 'Updated', data: settings })
})

