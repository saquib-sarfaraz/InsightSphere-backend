import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    name: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'review', 'done'],
      default: 'in_progress',
      index: true,
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    ownerName: { type: String, trim: true, default: '' },
    tags: { type: [String], default: [] },
    updatedAtLabel: { type: String, default: 'Today' },
  },
  { timestamps: true },
)

projectSchema.index({ userId: 1, createdAt: -1 })

export const Project = mongoose.model('Project', projectSchema)
