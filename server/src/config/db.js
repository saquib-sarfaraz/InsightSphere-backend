import mongoose from 'mongoose'
import { env } from './env.js'
import { logger } from '../logs/logger.js'

const MAX_RETRIES = 5
const BASE_DELAY_MS = 800

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function connectDb() {
  mongoose.set('strictQuery', true)

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10_000,
      })
      const { host, name, port } = mongoose.connection
      logger.info({ host, port, db: name }, 'MongoDB connected')
      return
    } catch (err) {
      logger.error({ err, attempt }, 'MongoDB connection failed')
      if (attempt < MAX_RETRIES) await delay(BASE_DELAY_MS * attempt)
      else throw err
    }
  }
}

export async function disconnectDb() {
  try {
    await mongoose.connection.close()
    logger.info('MongoDB disconnected')
  } catch (err) {
    logger.error({ err }, 'MongoDB disconnect error')
  }
}
