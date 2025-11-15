import mongoose, { Document, Schema } from 'mongoose';

export interface IMoodTrend {
  day: number;
  score: number;
}

export interface IInsight extends Document {
  goalId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  weekNumber: number;
  summary: string;
  moodTrend: IMoodTrend[];
  motivationLevel: number; // 0-100
  blockers: string[];
  recommendations: string[];
  highlights: string[];
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const moodTrendSchema = new Schema<IMoodTrend>({
  day: Number,
  score: Number,
});

const insightSchema = new Schema<IInsight>(
  {
    goalId: {
      type: Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    moodTrend: {
      type: [moodTrendSchema],
      default: [],
    },
    motivationLevel: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    blockers: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying insights by goal
insightSchema.index({ goalId: 1, generatedAt: -1 });
insightSchema.index({ userId: 1, generatedAt: -1 });

export const Insight = mongoose.model<IInsight>('Insight', insightSchema);
