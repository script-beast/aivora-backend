import mongoose, { Document, Schema } from 'mongoose';

export interface IDayPlan {
  day: number;
  task: string;
  focus: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedHours: number;
  isRestDay?: boolean;
}

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  duration: number; // days
  hoursPerDay: number;
  plan: IDayPlan[];
  status: 'active' | 'completed' | 'abandoned';
  startDate: Date;
  completedDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const dayPlanSchema = new Schema<IDayPlan>({
  day: {
    type: Number,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  focus: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  estimatedHours: {
    type: Number,
    required: true,
  },
  isRestDay: {
    type: Boolean,
    default: false,
  },
});

const goalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 day'],
      max: [365, 'Duration cannot exceed 365 days'],
    },
    hoursPerDay: {
      type: Number,
      required: [true, 'Hours per day is required'],
      min: [0.5, 'Hours per day must be at least 0.5'],
      max: [12, 'Hours per day cannot exceed 12'],
    },
    plan: {
      type: [dayPlanSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    completedDays: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, createdAt: -1 });

export const Goal = mongoose.model<IGoal>('Goal', goalSchema);
