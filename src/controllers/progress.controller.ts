import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Progress } from '../models/Progress';
import { Goal } from '../models/Goal';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { analyzeSentiment } from '../ai/utils/sentimentAnalyzer';

// @desc    Create or update progress entry
// @route   POST /api/progress
// @access  Private
export const createProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { goalId, day, completed, comment, hoursSpent } = req.body;

  // Verify goal belongs to user
  const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
  if (!goal) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  // Analyze sentiment if comment provided
  let sentimentScore = 0;
  if (comment) {
    const sentiment = analyzeSentiment(comment);
    sentimentScore = sentiment.score;
  }

  // Check if progress for this day already exists
  let progress = await Progress.findOne({ goalId, day });

  if (progress) {
    // Update existing
    progress.completed = completed;
    progress.comment = comment;
    progress.sentimentScore = sentimentScore;
    progress.hoursSpent = hoursSpent;
    progress.timestamp = new Date();
    await progress.save();
  } else {
    // Create new
    progress = await Progress.create({
      goalId,
      userId: req.userId,
      day,
      completed,
      comment,
      sentimentScore,
      hoursSpent,
    });
  }

  // Update goal's completed days count
  const completedCount = await Progress.countDocuments({ goalId, completed: true });
  goal.completedDays = completedCount;

  // Check if goal is completed
  if (completedCount >= goal.duration) {
    goal.status = 'completed';
  }

  await goal.save();

  res.status(201).json({ progress });
});

// @desc    Get progress for a goal
// @route   GET /api/progress/goal/:goalId
// @access  Private
export const getProgressByGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { goalId } = req.params;

  // Verify goal belongs to user
  const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
  if (!goal) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  const progress = await Progress.find({ goalId }).sort({ day: 1 });

  res.json({ progress, count: progress.length });
});

// @desc    Update progress entry
// @route   PUT /api/progress/:id
// @access  Private
export const updateProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { completed, comment, hoursSpent } = req.body;

  const progress = await Progress.findOne({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!progress) {
    res.status(404).json({ error: 'Progress entry not found' });
    return;
  }

  // Analyze sentiment if comment provided
  if (comment !== undefined) {
    progress.comment = comment;
    if (comment) {
      const sentiment = analyzeSentiment(comment);
      progress.sentimentScore = sentiment.score;
    }
  }

  if (completed !== undefined) progress.completed = completed;
  if (hoursSpent !== undefined) progress.hoursSpent = hoursSpent;

  await progress.save();

  res.json({ progress });
});

// @desc    Get progress statistics
// @route   GET /api/progress/goal/:goalId/stats
// @access  Private
export const getProgressStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { goalId } = req.params;

  // Verify goal belongs to user
  const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
  if (!goal) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  const allProgress = await Progress.find({ goalId }).sort({ day: 1 });
  const completedProgress = allProgress.filter((p) => p.completed);

  // Calculate streak
  let currentStreak = 0;
  for (let i = allProgress.length - 1; i >= 0; i--) {
    if (allProgress[i].completed) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate average sentiment
  const sentiments = allProgress
    .filter((p) => p.sentimentScore !== undefined)
    .map((p) => p.sentimentScore!);
  const averageSentiment =
    sentiments.length > 0
      ? sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length
      : 0;

  // Calculate completion rate
  const completionRate = goal.duration > 0 
    ? (completedProgress.length / goal.duration) * 100 
    : 0;

  // Total hours spent
  const totalHours = allProgress
    .filter((p) => p.hoursSpent)
    .reduce((sum, p) => sum + (p.hoursSpent || 0), 0);

  res.json({
    stats: {
      totalDays: goal.duration,
      completedDays: completedProgress.length,
      completionRate: parseFloat(completionRate.toFixed(2)),
      currentStreak,
      averageSentiment: parseFloat(averageSentiment.toFixed(2)),
      totalHoursSpent: totalHours,
    },
  });
});
