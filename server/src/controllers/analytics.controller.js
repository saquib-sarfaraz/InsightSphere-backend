import { asyncHandler } from '../utils/async-handler.js'
import { ok } from '../utils/api-response.js'
import * as analyticsService from '../services/analytics.service.js'

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await analyticsService.listAnalytics({ query: req.validated.query })
  return ok(res, { data: items, meta })
})

export const intensity = asyncHandler(async (_req, res) => {
  const rows = await analyticsService.metricDistribution('intensity')
  return ok(res, { data: rows })
})

export const relevance = asyncHandler(async (_req, res) => {
  const rows = await analyticsService.metricDistribution('relevance')
  return ok(res, { data: rows })
})

export const likelihood = asyncHandler(async (_req, res) => {
  const rows = await analyticsService.metricDistribution('likelihood')
  return ok(res, { data: rows })
})

export const country = asyncHandler(async (_req, res) => {
  const rows = await analyticsService.groupBy('country')
  return ok(res, { data: rows })
})

export const topics = asyncHandler(async (_req, res) => {
  const rows = await analyticsService.groupBy('topic')
  return ok(res, { data: rows })
})

export const region = asyncHandler(async (_req, res) => {
  const rows = await analyticsService.groupBy('region')
  return ok(res, { data: rows })
})

export const year = asyncHandler(async (_req, res) => {
  const rows = await analyticsService.groupBy('end_year')
  return ok(res, { data: rows })
})

export const source = asyncHandler(async (_req, res) => {
  const rows = await analyticsService.groupBy('source')
  return ok(res, { data: rows })
})

export const sector = asyncHandler(async (_req, res) => {
  const rows = await analyticsService.groupBy('sector')
  return ok(res, { data: rows })
})

export const pestle = asyncHandler(async (_req, res) => {
  const rows = await analyticsService.groupBy('pestle')
  return ok(res, { data: rows })
})

export const overview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOverview({ userId: req.user?._id })
  return ok(res, { data })
})
