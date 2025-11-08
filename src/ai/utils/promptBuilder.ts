export const cleanJsonResponse = (response: string): string => {
  // Remove markdown code blocks if present
  let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();

  return cleaned;
};

export const parseJsonResponse = (response: string): any => {
  try {
    const cleaned = cleanJsonResponse(response);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse JSON response:', response);
    throw new Error('Invalid JSON response from AI');
  }
};

export const validatePlanStructure = (plan: any[]): boolean => {
  if (!Array.isArray(plan)) return false;

  return plan.every(
    (day) =>
      typeof day.day === 'number' &&
      typeof day.task === 'string' &&
      typeof day.focus === 'string' &&
      ['Easy', 'Medium', 'Hard'].includes(day.difficulty) &&
      typeof day.estimatedHours === 'number'
  );
};

export const validateInsightStructure = (insight: any): boolean => {
  return (
    typeof insight.summary === 'string' &&
    Array.isArray(insight.moodTrend) &&
    typeof insight.motivationLevel === 'number' &&
    Array.isArray(insight.blockers) &&
    Array.isArray(insight.recommendations)
  );
};
