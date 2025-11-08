import { HumanMessage } from '@langchain/core/messages';
import { createModel } from '../config/model.config';
import { createInsightsPrompt } from '../prompts/insights.prompt';
import { parseJsonResponse, validateInsightStructure } from '../utils/promptBuilder';

export interface MoodTrend {
  day: number;
  score: number;
}

export interface InsightData {
  summary: string;
  moodTrend: MoodTrend[];
  motivationLevel: number;
  blockers: string[];
  recommendations: string[];
  highlights: string[];
}

export const generateInsights = async (progressData: any[]): Promise<InsightData> => {
  try {
    if (progressData.length === 0) {
      return {
        summary: 'No progress data available yet. Start tracking your journey!',
        moodTrend: [],
        motivationLevel: 50,
        blockers: [],
        recommendations: ['Begin tracking your daily progress', 'Add comments to your entries'],
        highlights: [],
      };
    }

    const model = createModel(0.8);
    const prompt = createInsightsPrompt(progressData);

    const response = await model.invoke([new HumanMessage(prompt)]);
    const content = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);

    const insight = parseJsonResponse(content);

    if (!validateInsightStructure(insight)) {
      throw new Error('Invalid insight structure returned from AI');
    }

    return insight;
  } catch (error: any) {
    console.error('Error generating insights:', error);
    throw new Error(`Failed to generate insights: ${error.message}`);
  }
};

export default { generateInsights };
