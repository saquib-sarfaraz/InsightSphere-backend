import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true, required: true },
    profile: {
      displayName: { type: String, default: '' },
      timezone: { type: String, default: 'UTC' },
    },
    theme: {
      mode: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    },
    notifications: {
      product: { type: Boolean, default: true },
      alerts: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
)

export const Settings = mongoose.model('Settings', settingsSchema)

