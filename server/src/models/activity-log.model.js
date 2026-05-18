import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, default: '' },
    entityId: { type: String, default: '' },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true },
)

activityLogSchema.index({ createdAt: -1 })

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema)

