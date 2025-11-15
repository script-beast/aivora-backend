import { Response } from 'express';
import { Insight } from '../models/Insight';
import { Goal } from '../models/Goal';
import { Progress } from '../models/Progress';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { generateInsights as generateAIInsights } from '../ai/chains/insightAnalyzerChain';

// @desc    Generate AI insights for a goal
// @route   POST /api/insights/generate/:goalId
// @access  Private
export const generateInsights = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { goalId } = req.params;

  // Verify goal belongs to user
  const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
  if (!goal) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  // Get progress data
  const progressData = await Progress.find({ goalId }).sort({ day: 1 });

  if (progressData.length === 0) {
    res.status(400).json({ error: 'No progress data available for insights' });
    return;
  }

  // Generate insights using AI
  const insightData = await generateAIInsights(progressData);

  // Calculate week number based on completed progress
  const completedProgress = progressData.filter(p => p.completed);
  const weekNumber = Math.ceil(completedProgress.length / 7);

  // Always create a new insight (don't update existing ones)
  // This preserves history of all generated insights
  const insight = await Insight.create({
    goalId,
    userId: req.userId,
    weekNumber,
    summary: insightData.summary,
    moodTrend: insightData.moodTrend,
    motivationLevel: insightData.motivationLevel,
    blockers: insightData.blockers,
    recommendations: insightData.recommendations,
    highlights: insightData.highlights || [],
  });

  res.status(201).json({ insight });
});

// @desc    Get all insights for a goal
// @route   GET /api/insights/goal/:goalId
// @access  Private
export const getInsightsByGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { goalId } = req.params;

  // Verify goal belongs to user
  const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
  if (!goal) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  const insights = await Insight.find({ goalId }).sort({ weekNumber: -1 });

  res.json({ insights, count: insights.length });
});

// @desc    Get latest insight for a goal
// @route   GET /api/insights/goal/:goalId/latest
// @access  Private
export const getLatestInsight = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { goalId } = req.params;

  // Verify goal belongs to user
  const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
  if (!goal) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  const insight = await Insight.findOne({ goalId }).sort({ generatedAt: -1 });

  if (!insight) {
    res.status(404).json({ error: 'No insights available' });
    return;
  }

  res.json({ insight });
});
