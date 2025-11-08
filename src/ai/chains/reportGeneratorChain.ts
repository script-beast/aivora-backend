import { HumanMessage } from '@langchain/core/messages';
import { createFastModel } from '../config/model.config';
import { createReportPrompt } from '../prompts/report.prompt';

export interface ReportData {
  goalTitle: string;
  duration: number;
  hoursPerDay: number;
  completionRate: number;
  completedDays: number;
  totalDays: number;
  currentStreak: number;
  averageSentiment: number;
  keyInsights: string[];
}

export const generateReportSummary = async (data: ReportData): Promise<string> => {
  try {
    const model = createFastModel(0.7);
    const prompt = createReportPrompt(data);

    const response = await model.invoke([new HumanMessage(prompt)]);
    const content = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);

    return content.trim();
  } catch (error: any) {
    console.error('Error generating report summary:', error);
    throw new Error(`Failed to generate report summary: ${error.message}`);
  }
};

export default { generateReportSummary };
