import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Goal } from '../models/Goal';
import { Progress } from '../models/Progress';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { generateGoalPlan } from '../ai/chains/goalPlannerChain';
import { regeneratePlan } from '../ai/chains/regenerationChain';

// @desc    Create new goal with AI-generated plan
// @route   POST /api/goals
// @access  Private
export const createGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { title, description, duration, hoursPerDay, additionalContext } = req.body;

  // Generate AI plan
  const plan = await generateGoalPlan(title, duration, hoursPerDay, additionalContext);

  // Create goal
  const goal = await Goal.create({
    userId: req.userId,
    title,
    description,
    duration,
    hoursPerDay,
    plan,
    status: 'active',
  });

  res.status(201).json({ goal });
});

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
export const getGoals = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.query;

  const filter: any = { userId: req.userId };
  if (status) {
    filter.status = status;
  }

  const goals = await Goal.find(filter).sort({ createdAt: -1 });

  res.json({ goals, count: goals.length });
});

// @desc    Get goal by ID
// @route   GET /api/goals/:id
// @access  Private
export const getGoalById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const goal = await Goal.findOne({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!goal) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  res.json({ goal });
});

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, status } = req.body;

  const goal = await Goal.findOne({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!goal) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  if (title) goal.title = title;
  if (description) goal.description = description;
  if (status) goal.status = status;

  await goal.save();

  res.json({ goal });
});

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const goal = await Goal.findOne({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!goal) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  await goal.deleteOne();

  // Also delete associated progress
  await Progress.deleteMany({ goalId: goal._id });

  res.json({ message: 'Goal deleted successfully' });
});

// @desc    Regenerate goal plan based on progress
// @route   POST /api/goals/:id/regenerate
// @access  Private
export const regenerateGoalPlan = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { feedback } = req.body;

  const goal = await Goal.findOne({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!goal) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  // Get progress data
  const progressData = await Progress.find({ goalId: goal._id }).sort({ day: 1 });

  const completedDays = goal.completedDays;
  const remainingDays = goal.duration - completedDays;

  if (remainingDays <= 0) {
    res.status(400).json({ error: 'Goal already completed' });
    return;
  }

  // Generate new plan
  const newPlan = await regeneratePlan(
    goal.title,
    completedDays,
    remainingDays,
    goal.plan,
    progressData,
    feedback
  );

  // Update goal with new plan (keep completed portion)
  goal.plan = [...goal.plan.slice(0, completedDays), ...newPlan];
  await goal.save();

  res.json({ goal, message: 'Plan regenerated successfully' });
});
