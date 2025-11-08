import { Router } from 'express';
import { body } from 'express-validator';
import {
  createProgress,
  getProgressByGoal,
  updateProgress,
  getProgressStats,
} from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation
const progressValidation = [
  body('goalId').notEmpty().withMessage('Goal ID is required'),
  body('day').isInt({ min: 1 }).withMessage('Day must be a positive integer'),
  body('completed').isBoolean().withMessage('Completed must be boolean'),
];

// Routes
router.post('/', progressValidation, createProgress);
router.get('/goal/:goalId', getProgressByGoal);
router.get('/goal/:goalId/stats', getProgressStats);
router.put('/:id', updateProgress);

export default router;
