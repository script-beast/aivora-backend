import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  goalId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  day: number;
  completed: boolean;
  comment?: string;
  sentimentScore?: number; // -1 to 1
  hoursSpent?: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
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
    day: {
      type: Number,
      required: [true, 'Day is required'],
      min: [1, 'Day must be at least 1'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1,
    },
    hoursSpent: {
      type: Number,
      min: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique day per goal
progressSchema.index({ goalId: 1, day: 1 }, { unique: true });
progressSchema.index({ userId: 1, timestamp: -1 });

export const Progress = mongoose.model<IProgress>('Progress', progressSchema);
