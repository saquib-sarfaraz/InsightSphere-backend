import { createClient } from 'redis'
import { env } from '../config/env.js'
import { logger } from '../logs/logger.js'

let client = null

export async function getRedis() {
  if (!env.REDIS_URL) return null
  if (client) return client

  client = createClient({ url: env.REDIS_URL })
  client.on('error', (err) => logger.error({ err }, 'Redis error'))
  await client.connect()
  logger.info('Redis connected')
  return client
}

