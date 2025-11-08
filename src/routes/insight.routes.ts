import { Router } from 'express';
import {
  generateInsights,
  getInsightsByGoal,
  getLatestInsight,
} from '../controllers/insight.controller';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.post('/generate/:goalId', aiLimiter, generateInsights);
router.get('/goal/:goalId', getInsightsByGoal);
router.get('/goal/:goalId/latest', getLatestInsight);

export default router;
