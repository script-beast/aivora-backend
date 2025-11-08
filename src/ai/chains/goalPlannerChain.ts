import { HumanMessage } from '@langchain/core/messages';
import { createModel } from '../config/model.config';
import { createGoalPlannerPrompt } from '../prompts/goalPlanner.prompt';
import { parseJsonResponse, validatePlanStructure } from '../utils/promptBuilder';

export interface DayPlan {
  day: number;
  task: string;
  focus: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedHours: number;
  isRestDay?: boolean;
}

export const generateGoalPlan = async (
  goalTitle: string,
  duration: number,
  hoursPerDay: number,
  additionalContext?: string
): Promise<DayPlan[]> => {
  try {
    const model = createModel(0.7);
    const prompt = createGoalPlannerPrompt(
      goalTitle,
      duration,
      hoursPerDay,
      additionalContext
    );

    const response = await model.invoke([new HumanMessage(prompt)]);
    const content = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);

    const plan = parseJsonResponse(content);

    if (!validatePlanStructure(plan)) {
      throw new Error('Invalid plan structure returned from AI');
    }

    return plan;
  } catch (error: any) {
    // console.error('Error generating goal plan:', error);
    throw new Error(`Failed to generate goal plan: ${error.message}`);
  }
};

export default { generateGoalPlan };
