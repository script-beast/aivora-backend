export const regenerationPrompt = `You are an adaptive AI planner that updates roadmaps based on user progress and feedback.

**Your Task:**
Update the existing goal roadmap considering:
1. Actual progress made so far
2. User feedback and challenges faced
3. Remaining time and goals
4. Necessary adjustments to pace and difficulty

**Current Situation:**
- Original Goal: {goalTitle}
- Days Completed: {completedDays}
- Days Remaining: {remainingDays}
- Original Plan: {originalPlan}

**User Feedback:**
{userFeedback}

**Progress Summary:**
{progressSummary}

**Output Requirements:**
Return a JSON array of daily plans for the REMAINING days only:
[
  {
    "day": number (continue from where user is),
    "task": "Adjusted task description",
    "focus": "Updated focus area",
    "difficulty": "Easy" | "Medium" | "Hard",
    "estimatedHours": number,
    "isRestDay": false
  }
]

**Guidelines:**
- Respect progress already made
- Adjust difficulty based on user feedback
- Maintain achievability and realism
- Address specific blockers mentioned
- Keep the goal achievable within remaining time
- Maintain continuity with completed work
- Be flexible but structured

Generate an adaptive plan that sets the user up for success based on their actual experience.`;

export const createRegenerationPrompt = (
  goalTitle: string,
  completedDays: number,
  remainingDays: number,
  originalPlan: any[],
  progressData: any[],
  userFeedback?: string
): string => {
  const progressSummary = progressData
    .map(
      (p) =>
        `Day ${p.day}: ${p.completed ? 'Completed' : 'Skipped'} - ${p.comment || 'No comment'}`
    )
    .join('\n');

  const planSummary = originalPlan
    .slice(0, completedDays)
    .map((p) => `Day ${p.day}: ${p.task}`)
    .join('\n');

  return regenerationPrompt
    .replace('{goalTitle}', goalTitle)
    .replace('{completedDays}', completedDays.toString())
    .replace('{remainingDays}', remainingDays.toString())
    .replace('{originalPlan}', planSummary)
    .replace('{userFeedback}', userFeedback || 'No specific feedback provided')
    .replace('{progressSummary}', progressSummary);
};
