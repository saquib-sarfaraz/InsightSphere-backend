import { AnalyticsData } from '../models/analytics-data.model.js'
import { ActivityLog } from '../models/activity-log.model.js'
import { User } from '../models/user.model.js'
import { parsePagination } from '../utils/pagination.js'
import { buildSearchQuery } from '../utils/query-builder.js'

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function dayKey(date) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function stableHash(input) {
  let h = 0
  const s = String(input ?? '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function pickFilters(query) {
  const filters = {}
  const map = [
    'end_year',
    'start_year',
    'topic',
    'sector',
    'region',
    'source',
    'country',
    'city',
    'pestle',
  ]

  for (const key of map) {
    const value = query[key]
    if (!value) continue
    if (key === 'end_year' || key === 'start_year') filters[key] = Number(value)
    else filters[key] = value
  }
  return filters
}

export async function listAnalytics({ query }) {
  const { page, limit, skip } = parsePagination(query, { page: 1, limit: 25 })
  const filters = pickFilters(query)

  const search = buildSearchQuery({ search: query.search, fields: ['title', 'insight', 'topic', 'sector'] })
  const q = search ? { ...filters, ...search } : filters

  const [items, total] = await Promise.all([
    AnalyticsData.find(q).sort({ published: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    AnalyticsData.countDocuments(q),
  ])

  return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 } }
}

export async function groupBy(field, { filters = {} } = {}) {
  const pipeline = [
    { $match: filters },
    { $group: { _id: `$${field}`, count: { $sum: 1 }, avgIntensity: { $avg: '$intensity' }, avgRelevance: { $avg: '$relevance' } } },
    { $project: { _id: 0, key: '$_id', count: 1, avgIntensity: { $round: ['$avgIntensity', 2] }, avgRelevance: { $round: ['$avgRelevance', 2] } } },
    { $sort: { count: -1 } },
    { $limit: 50 },
  ]
  return AnalyticsData.aggregate(pipeline)
}

export async function metricDistribution(metric, { filters = {} } = {}) {
  const pipeline = [
    { $match: filters },
    { $group: { _id: `$${metric}`, count: { $sum: 1 } } },
    { $project: { _id: 0, value: '$_id', count: 1 } },
    { $sort: { value: 1 } },
  ]
  return AnalyticsData.aggregate(pipeline)
}

export async function distinctValues(field, { filters = {} } = {}) {
  const pipeline = [
    { $match: filters },
    { $group: { _id: `$${field}` } },
    { $project: { _id: 0, value: '$_id' } },
    { $sort: { value: 1 } },
  ]
  const rows = await AnalyticsData.aggregate(pipeline)
  return rows.map((r) => r.value).filter(Boolean)
}

export async function getOverview({ userId } = {}) {
  const total = await AnalyticsData.estimatedDocumentCount()

  if (total === 0) {
    const activityFeed = await getActivityFeed({ userId, seed: 0 })
    const team = await getTeam({ userId })
    return {
      kpi: [],
      revenueSeries: [],
      trafficSources: [],
      deviceMix: [],
      activityFeed,
      team,
      breakdowns: {
        topTopics: [],
        topCountries: [],
      },
    }
  }

  const [topTopics, topCountries, topSources] = await Promise.all([
    AnalyticsData.aggregate([
      { $match: { topic: { $nin: [null, ''] } } },
      { $group: { _id: '$topic', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: '$_id', value: '$count' } },
    ]),
    AnalyticsData.aggregate([
      { $match: { country: { $nin: [null, ''] } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: '$_id', value: '$count' } },
    ]),
    AnalyticsData.aggregate([
      { $match: { source: { $nin: [null, ''] } } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { _id: 0, name: '$_id', value: '$count' } },
    ]),
  ])

  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  start.setUTCDate(start.getUTCDate() - 29)

  const rows = await AnalyticsData.aggregate([
    { $match: { published: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$published' } },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0, day: '$_id', count: 1 } },
    { $sort: { day: 1 } },
  ])

  const byDay = new Map(rows.map((r) => [r.day, r.count]))
  const seed = stableHash(userId || total)
  const revenueSeries = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + i)
    const key = dayKey(d)
    const count = byDay.get(key) ?? 0
    const baseline = total > 0 ? 9500 : 7200
    const wave = Math.sin((i + (seed % 9)) / 4) * 1200
    const noise = ((seed + i * 17) % 7) * 140
    const fromData = count > 0 ? count * 420 : 0
    const revenue = Math.max(1200, Math.round(baseline + wave + noise + fromData))
    revenueSeries.push({ day: i + 1, revenue })
  }

  const deviceMix = (() => {
    const a = (seed % 19) + 52
    const b = ((seed >> 5) % 17) + 26
    const c = clamp(100 - a - b, 6, 14)
    return [
      { name: 'Desktop', value: a },
      { name: 'Mobile', value: b },
      { name: 'Tablet', value: c },
    ]
  })()

  const trafficSources =
    topSources?.length > 0
      ? normalizeSeries(topSources, ['Direct', 'Organic', 'Referral', 'Paid'])
      : [
          { name: 'Direct', value: 38 },
          { name: 'Organic', value: 27 },
          { name: 'Referral', value: 18 },
          { name: 'Paid', value: 17 },
        ]

  const kpi = [
    {
      key: 'revenue',
      label: 'Revenue',
      value: revenueSeries.reduce((sum, d) => sum + d.revenue, 0),
      delta: Number(((seed % 19) - 4 + 10.4).toFixed(1)),
      prefix: '$',
    },
    {
      key: 'activeUsers',
      label: 'Active users',
      value: Math.max(320, Math.round((total || 1200) / 7) + (seed % 420)),
      delta: Number((((seed >> 3) % 9) + 2.1).toFixed(1)),
    },
    {
      key: 'retention',
      label: 'Retention',
      value: Number((72 + ((seed >> 8) % 9) + 0.2).toFixed(1)),
      delta: Number((((seed >> 11) % 5) - 0.4).toFixed(1)),
      suffix: '%',
    },
    {
      key: 'conversion',
      label: 'Conversion',
      value: Number((4.1 + ((seed >> 15) % 11) / 10).toFixed(1)),
      delta: Number((((seed >> 18) % 9) / 10 - 0.6).toFixed(1)),
      suffix: '%',
    },
  ]

  const activityFeed = await getActivityFeed({ userId, seed })
  const team = await getTeam({ userId })

  return {
    kpi,
    revenueSeries,
    trafficSources,
    deviceMix,
    activityFeed,
    team,
    breakdowns: {
      topTopics,
      topCountries,
    },
  }
}

function normalizeSeries(rows, fallbacks) {
  const total = rows.reduce((s, r) => s + (r.value || 0), 0) || 1
  const pick = rows
    .slice(0, 4)
    .map((r, i) => ({ name: r.name || fallbacks[i] || `Source ${i + 1}`, value: r.value || 0 }))
  const mapped = pick.map((r) => ({ ...r, value: Math.round((r.value / total) * 100) }))
  const fix = 100 - mapped.reduce((s, r) => s + r.value, 0)
  if (mapped.length) mapped[0].value += fix
  return mapped
}

async function getActivityFeed({ userId, seed }) {
  if (!userId) return syntheticActivity(seed)
  const logs = await ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(8).lean()
  if (!logs.length) return []

  const now = Date.now()
  return logs.map((l) => ({
    id: String(l._id),
    title: titleForAction(l.action),
    description: l.entity ? `${l.entity}${l.entityId ? ` • ${l.entityId}` : ''}` : 'Workspace activity',
    time: relativeTime(now - new Date(l.createdAt).getTime()),
    tone: toneForAction(l.action),
  }))
}

function syntheticActivity(seed) {
  const minutes = (seed % 18) + 2
  return [
    {
      id: `a_${seed}_01`,
      title: 'New workspace member',
      description: 'Priya N. joined “Northstar Analytics”.',
      time: `${minutes}m ago`,
      tone: 'info',
    },
    {
      id: `a_${seed}_02`,
      title: 'Alert rule triggered',
      description: 'Spike detected on “Signup conversions”.',
      time: `${minutes + 16}m ago`,
      tone: 'warning',
    },
    {
      id: `a_${seed}_03`,
      title: 'Report shared',
      description: '“Executive Weekly” sent to stakeholders.',
      time: '3h ago',
      tone: 'success',
    },
    {
      id: `a_${seed}_04`,
      title: 'Integration connected',
      description: 'Stripe connected to workspace.',
      time: 'Yesterday',
      tone: 'info',
    },
  ]
}

function relativeTime(ms) {
  const min = Math.floor(ms / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d === 1 ? 'Yesterday' : `${d}d ago`
}

function titleForAction(action) {
  if (action === 'auth.login') return 'Signed in'
  if (action === 'auth.register') return 'Account created'
  if (action === 'notifications.read') return 'Notification reviewed'
  if (action === 'settings.updated') return 'Settings updated'
  return 'Workspace update'
}

function toneForAction(action) {
  if (action?.includes('failed')) return 'warning'
  if (action?.includes('updated')) return 'success'
  return 'info'
}

async function getTeam({ userId }) {
  if (!userId) return defaultTeam()
  const users = await User.find({ _id: { $ne: userId } }).sort({ createdAt: -1 }).limit(3).lean()
  if (!users.length) return defaultTeam()
  return [
    { id: 'me', name: 'You', role: 'Owner', initials: 'YO' },
    ...users.map((u) => ({
      id: String(u._id),
      name: u.name,
      role: u.role === 'admin' ? 'Admin' : 'Member',
      initials: initials(u.name),
    })),
  ].slice(0, 4)
}

function defaultTeam() {
  return [
    { id: 't1', name: 'Ava Chen', role: 'Product', initials: 'AC' },
    { id: 't2', name: 'Rohan Singh', role: 'Engineering', initials: 'RS' },
    { id: 't3', name: 'Zara Khan', role: 'Design', initials: 'ZK' },
    { id: 't4', name: 'Noah Park', role: 'Data', initials: 'NP' },
  ]
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] || 'U'
  const b = parts[1]?.[0] || parts[0]?.[1] || ''
  return (a + b).toUpperCase()
}
