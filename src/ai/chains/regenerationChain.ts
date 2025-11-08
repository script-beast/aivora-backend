import { HumanMessage } from '@langchain/core/messages';
import { createModel } from '../config/model.config';
import { createRegenerationPrompt } from '../prompts/regeneration.prompt';
import { parseJsonResponse, validatePlanStructure } from '../utils/promptBuilder';
import { DayPlan } from './goalPlannerChain';

export const regeneratePlan = async (
  goalTitle: string,
  completedDays: number,
  remainingDays: number,
  originalPlan: DayPlan[],
  progressData: any[],
  userFeedback?: string
): Promise<DayPlan[]> => {
  try {
    const model = createModel(0.7);
    const prompt = createRegenerationPrompt(
      goalTitle,
      completedDays,
      remainingDays,
      originalPlan,
      progressData,
      userFeedback
    );

    const response = await model.invoke([new HumanMessage(prompt)]);
    const content = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);

    const newPlan = parseJsonResponse(content);

    if (!validatePlanStructure(newPlan)) {
      throw new Error('Invalid plan structure returned from AI');
    }

    // Ensure day numbers continue from where user left off
    const adjustedPlan = newPlan.map((day: DayPlan, index: number) => ({
      ...day,
      day: completedDays + index + 1,
    }));

    return adjustedPlan;
  } catch (error: any) {
    console.error('Error regenerating plan:', error);
    throw new Error(`Failed to regenerate plan: ${error.message}`);
  }
};

export default { regeneratePlan };
