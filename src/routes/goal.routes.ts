import { Router } from 'express';
import { body } from 'express-validator';
import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  regenerateGoalPlan,
} from '../controllers/goal.controller';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation
const createGoalValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('duration')
    .isInt({ min: 1, max: 365 })
    .withMessage('Duration must be between 1 and 365 days'),
  body('hoursPerDay')
    .isFloat({ min: 0.5, max: 12 })
    .withMessage('Hours per day must be between 0.5 and 12'),
];

// Routes
router.post('/', aiLimiter, createGoalValidation, createGoal);
router.get('/', getGoals);
router.get('/:id', getGoalById);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/regenerate', aiLimiter, regenerateGoalPlan);

export default router;
