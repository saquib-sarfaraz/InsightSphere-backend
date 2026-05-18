import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    tone: { type: String, enum: ['info', 'success', 'warning'], default: 'info', index: true },
    readAt: { type: Date, default: null },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true },
)

notificationSchema.index({ userId: 1, createdAt: -1 })

export const Notification = mongoose.model('Notification', notificationSchema)

