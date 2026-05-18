import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import { logger } from '../logs/logger.js'

function createTransport() {
  if (!env.SMTP_HOST) return null
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: false,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  })
}

export async function sendEmail({ to, subject, html }) {
  const transporter = createTransport()
  if (!transporter) {
    logger.warn({ to, subject }, 'SMTP not configured; email suppressed')
    return
  }
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html,
  })
}

