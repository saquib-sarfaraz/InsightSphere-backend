import { Settings } from '../models/settings.model.js'

export async function getMySettings(userId) {
  const settings = await Settings.findOne({ userId }).lean()
  if (settings) return settings
  return Settings.create({ userId })
}

export async function updateMySettings(userId, patch) {
  return Settings.findOneAndUpdate({ userId }, patch, { new: true, upsert: true }).lean()
}

