import { asyncHandler } from '../utils/async-handler.js'
import { ok } from '../utils/api-response.js'
import { distinctValues } from '../services/analytics.service.js'

export const topics = asyncHandler(async (_req, res) => {
  const values = await distinctValues('topic')
  return ok(res, { data: values })
})

export const regions = asyncHandler(async (_req, res) => {
  const values = await distinctValues('region')
  return ok(res, { data: values })
})

export const sectors = asyncHandler(async (_req, res) => {
  const values = await distinctValues('sector')
  return ok(res, { data: values })
})

export const sources = asyncHandler(async (_req, res) => {
  const values = await distinctValues('source')
  return ok(res, { data: values })
})

export const countries = asyncHandler(async (_req, res) => {
  const values = await distinctValues('country')
  return ok(res, { data: values })
})

export const pestle = asyncHandler(async (_req, res) => {
  const values = await distinctValues('pestle')
  return ok(res, { data: values })
})

