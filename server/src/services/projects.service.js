import { Project } from '../models/project.model.js'
import { parsePagination } from '../utils/pagination.js'

export async function listProjects(userId, query) {
  const { page, limit, skip } = parsePagination(query, { page: 1, limit: 20 })
  const filters = { userId }
  if (query.status) filters.status = query.status

  const [items, total] = await Promise.all([
    Project.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Project.countDocuments(filters),
  ])

  return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 } }
}

export async function createProject(userId, body, { ownerName = '' } = {}) {
  const progressByStatus = {
    planned: 15,
    in_progress: 45,
    review: 84,
    done: 100,
  }
  const status = body.status || 'planned'
  const progress = body.progress ?? progressByStatus[status] ?? 0

  const project = await Project.create({
    userId,
    name: body.name,
    description: body.description || '',
    status,
    progress,
    ownerName,
    tags: body.tags || [],
    updatedAtLabel: 'Just now',
  })
  return project.toObject()
}
