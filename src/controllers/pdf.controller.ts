import { Request, Response } from 'express';
import { Goal } from '../models/Goal';
import { Progress } from '../models/Progress';
import { Insight } from '../models/Insight';
import { generateGoalReportPDF } from '../services/pdf.service';
import { AuthRequest } from '../middleware/auth';

export const generateReport = async (req: Request, res: Response) => {
  try {
    const { goalId } = req.params;
    const userId = (req as AuthRequest).userId;

    // Fetch goal with user verification
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Fetch progress
    const progress = await Progress.find({ goalId }).sort({ day: 1 });

    // Fetch insights
    const insights = await Insight.find({ goalId }).sort({ createdAt: -1 }).limit(1);

    // Calculate statistics
    const completedProgress = progress.filter((p) => p.completed);
    const totalDays = goal.plan.length;
    const completedDays = completedProgress.length;
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    
    // Calculate streak
    let currentStreak = 0;
    for (let i = progress.length - 1; i >= 0; i--) {
      if (progress[i].completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    const totalHoursSpent = completedProgress.reduce((sum, p) => sum + (p.hoursSpent || 0), 0);
    const averageSentiment =
      completedProgress.length > 0
        ? completedProgress.reduce((sum, p) => sum + (p.sentimentScore || 0), 0) / completedProgress.length
        : 0;

    const stats = {
      totalDays,
      completedDays,
      completionRate,
      currentStreak,
      totalHoursSpent,
      averageSentiment,
    };

    // Generate PDF
    const pdfDoc = await generateGoalReportPDF({
      goal: goal.toObject(),
      progress: progress.map((p) => p.toObject()),
      insights: insights.map((i) => i.toObject()),
      stats,
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="goal-report-${goalId}.pdf"`);

    // Pipe PDF to response
    pdfDoc.pipe(res);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
};
