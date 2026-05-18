import mongoose from 'mongoose'

const analyticsDataSchema = new mongoose.Schema(
  {
    end_year: { type: Number, index: true },
    intensity: { type: Number, index: true },
    sector: { type: String, index: true },
    topic: { type: String, index: true },
    insight: { type: String },
    url: { type: String },
    region: { type: String, index: true },
    start_year: { type: Number, index: true },
    impact: { type: Number },
    added: { type: Date, index: true },
    published: { type: Date, index: true },
    country: { type: String, index: true },
    relevance: { type: Number, index: true },
    pestle: { type: String, index: true },
    source: { type: String, index: true },
    title: { type: String, text: true },
    likelihood: { type: Number, index: true },
    city: { type: String, index: true },
  },
  { timestamps: true },
)

analyticsDataSchema.index({ topic: 1, sector: 1, region: 1, country: 1 })

export const AnalyticsData = mongoose.model('AnalyticsData', analyticsDataSchema)

