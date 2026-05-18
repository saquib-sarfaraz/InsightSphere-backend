import { asyncHandler } from '../utils/async-handler.js'
import { ok } from '../utils/api-response.js'
import * as projectsService from '../services/projects.service.js'

export const listMyProjects = asyncHandler(async (req, res) => {
  const { items, meta } = await projectsService.listProjects(req.user._id, req.validated.query)
  return ok(res, { data: items, meta })
})

export const createMyProject = asyncHandler(async (req, res) => {
  const project = await projectsService.createProject(req.user._id, req.validated.body, {
    ownerName: req.user?.name || 'You',
  })
  return ok(res, { message: 'Created', data: project })
})
