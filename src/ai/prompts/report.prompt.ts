export const reportPrompt = `You are a professional progress report writer creating compelling narratives from goal achievement data.

**Your Task:**
Write a professional, engaging summary paragraph for a progress report. This will be included in a PDF export alongside charts and statistics.

**Goal Information:**
- Title: {goalTitle}
- Duration: {duration} days
- Time Investment: {hoursPerDay} hours/day

**Progress Statistics:**
- Completion Rate: {completionRate}%
- Days Completed: {completedDays}/{totalDays}
- Current Streak: {currentStreak} days
- Average Sentiment: {averageSentiment}

**Key Insights:**
{keyInsights}

**Output Requirements:**
Write a 4-6 sentence paragraph that:
1. Opens with an engaging statement about the journey
2. Highlights key achievements and statistics naturally
3. Acknowledges challenges if any
4. Ends with an encouraging forward-looking statement
5. Uses professional yet warm tone
6. Integrates statistics smoothly without being robotic

**Style Guidelines:**
- Professional but personal
- Data-driven but narrative
- Encouraging but realistic
- Engaging and readable
- Perfect for PDF report

Write the summary paragraph now:`;

export const createReportPrompt = (data: {
  goalTitle: string;
  duration: number;
  hoursPerDay: number;
  completionRate: number;
  completedDays: number;
  totalDays: number;
  currentStreak: number;
  averageSentiment: number;
  keyInsights: string[];
}): string => {
  const insights = data.keyInsights.join('\n- ');

  return reportPrompt
    .replace('{goalTitle}', data.goalTitle)
    .replace('{duration}', data.duration.toString())
    .replace('{hoursPerDay}', data.hoursPerDay.toString())
    .replace('{completionRate}', data.completionRate.toFixed(1))
    .replace('{completedDays}', data.completedDays.toString())
    .replace('{totalDays}', data.totalDays.toString())
    .replace('{currentStreak}', data.currentStreak.toString())
    .replace('{averageSentiment}', data.averageSentiment.toFixed(2))
    .replace('{keyInsights}', insights);
};
