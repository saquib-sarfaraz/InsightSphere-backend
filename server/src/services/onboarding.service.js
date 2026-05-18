import { Notification } from '../models/notification.model.js'
import { ActivityLog } from '../models/activity-log.model.js'
import { Project } from '../models/project.model.js'

export async function ensureOnboardingData({ userId, userName }) {
  await Promise.all([
    ensureDefaultNotifications(userId),
    ensureDefaultActivity(userId),
    ensureDefaultProjects({ userId, userName }),
  ])
}

async function ensureDefaultNotifications(userId) {
  const count = await Notification.countDocuments({ userId })
  if (count > 0) return
  await Notification.insertMany([
    {
      userId,
      title: 'Workspace connected',
      description: 'Your dashboard is ready to ingest analytics streams.',
      tone: 'success',
    },
    {
      userId,
      title: 'Weekly report scheduled',
      description: 'Executive weekly will be generated every Monday at 9:00 AM.',
      tone: 'info',
    },
    {
      userId,
      title: 'Usage healthy',
      description: 'No anomalies detected across signup and activation funnels.',
      tone: 'info',
    },
  ])
}

async function ensureDefaultActivity(userId) {
  const count = await ActivityLog.countDocuments({ userId })
  if (count > 0) return
  await ActivityLog.insertMany([
    { userId, action: 'auth.register', entity: 'Workspace', entityId: 'Northstar Analytics' },
    { userId, action: 'settings.updated', entity: 'Settings', entityId: 'Theme: Dark' },
    { userId, action: 'notifications.read', entity: 'Notifications', entityId: 'Onboarding' },
  ])
}

async function ensureDefaultProjects({ userId, userName }) {
  const count = await Project.countDocuments({ userId })
  if (count > 0) return
  const ownerName = userName || 'Workspace'
  await Project.insertMany([
    {
      userId,
      name: 'Revenue Intelligence',
      description: 'Multi-source revenue model with anomaly detection and forecasting.',
      status: 'in_progress',
      progress: 62,
      ownerName,
      updatedAtLabel: 'Today',
      tags: ['Stripe', 'Dashboards', 'ML'],
    },
    {
      userId,
      name: 'Activation Funnel v2',
      description: 'Cohort retention views and improved conversion attribution.',
      status: 'review',
      progress: 84,
      ownerName,
      updatedAtLabel: 'Yesterday',
      tags: ['Events', 'Cohorts'],
    },
    {
      userId,
      name: 'Enterprise SSO Readiness',
      description: 'SAML + SCIM groundwork and audit log exports for enterprise.',
      status: 'planned',
      progress: 18,
      ownerName,
      updatedAtLabel: 'Last week',
      tags: ['Security', 'Identity'],
    },
  ])
}
