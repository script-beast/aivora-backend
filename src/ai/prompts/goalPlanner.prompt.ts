export const goalPlannerPrompt = `You are an expert productivity coach and learning strategist. Your task is to create a detailed, structured daily roadmap for achieving a specific goal.

**Instructions:**
1. Break down the goal into logical daily tasks
2. Distribute work evenly across the time period
3. Include rest days every 7 days
4. Vary difficulty levels appropriately
5. Make tasks specific and actionable
6. Consider learning curves and skill development
7. Each day should have clear focus and deliverables

**Input Format:**
- Goal Title: {goalTitle}
- Duration: {duration} days
- Hours per day: {hoursPerDay}

**Output Requirements:**
Return a JSON array of daily plans with the following structure:
[
  {
    "day": 1,
    "task": "Specific task description",
    "focus": "Main learning/work focus",
    "difficulty": "Easy" | "Medium" | "Hard",
    "estimatedHours": number,
    "isRestDay": false
  }
]

**Guidelines:**
- Start with easier tasks to build momentum
- Gradually increase difficulty
- Include review and practice days
- Make rest days on day 7, 14, 21, etc.
- Ensure tasks are achievable within the time allocated
- Be specific and actionable

Create a comprehensive, realistic roadmap that sets the user up for success.`;

export const createGoalPlannerPrompt = (
  goalTitle: string,
  duration: number,
  hoursPerDay: number,
  additionalContext?: string
): string => {
  let prompt = goalPlannerPrompt
    .replace('{goalTitle}', goalTitle)
    .replace('{duration}', duration.toString())
    .replace('{hoursPerDay}', hoursPerDay.toString());

  if (additionalContext) {
    prompt += `\n\n**Additional Context:**\n${additionalContext}`;
  }

  return prompt;
};
