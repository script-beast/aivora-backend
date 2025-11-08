// @ts-ignore - No type definitions available for sentiment package
import Sentiment from 'sentiment';

const sentimentAnalyzer = new Sentiment();

export interface SentimentResult {
  score: number; // Normalized to -1 to 1
  comparative: number;
  tokens: string[];
  positive: string[];
  negative: string[];
}

export const analyzeSentiment = (text: string): SentimentResult => {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      comparative: 0,
      tokens: [],
      positive: [],
      negative: [],
    };
  }

  const result = sentimentAnalyzer.analyze(text);

  // Normalize score to -1 to 1 range
  // Sentiment library scores range roughly from -5 to 5 for typical sentences
  const normalizedScore = Math.max(-1, Math.min(1, result.comparative));

  return {
    score: normalizedScore,
    comparative: result.comparative,
    tokens: result.tokens,
    positive: result.positive,
    negative: result.negative,
  };
};

export const getOverallSentiment = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

export const getSentimentTrend = (
  scores: number[]
): 'improving' | 'declining' | 'stable' => {
  if (scores.length < 3) return 'stable';

  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));

  const firstAvg = getOverallSentiment(firstHalf);
  const secondAvg = getOverallSentiment(secondHalf);

  const difference = secondAvg - firstAvg;

  if (difference > 0.1) return 'improving';
  if (difference < -0.1) return 'declining';
  return 'stable';
};

export default {
  analyzeSentiment,
  getOverallSentiment,
  getSentimentTrend,
};
