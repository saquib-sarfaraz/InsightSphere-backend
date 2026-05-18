import { connectDb, disconnectDb } from './server/src/config/db.js'
import { app } from './server/src/app.js'
import { env } from './server/src/config/env.js'
import { logger } from './server/src/logs/logger.js'

async function start() {
  await connectDb()

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'InsightSphere API listening')
  })

  const shutdown = async (signal) => {
    logger.warn({ signal }, 'Shutting down…')
    server.close(async () => {
      await disconnectDb()
      process.exit(0)
    })
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
