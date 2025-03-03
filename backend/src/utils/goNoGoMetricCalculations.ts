import { GoNoGoMetrics } from '../types/cognitive/goNoGo.types';
import { CognitiveProfile } from '../types/cognitive/shared.types';

export const calculateMeanGoNoGo = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
};

export const calculateProgressGoNoGo = (profile: CognitiveProfile): { improvement: number; consistency: number } => {
  if (!profile.trend || profile.trend.length < 2) {
    return { improvement: 0, consistency: 100 };
  }

  const scores = profile.trend
    .map(t => Object.values(t.metrics as Record<string, number>))
    .flat()
    .filter((n): n is number => typeof n === 'number');

  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));

  const improvement = ((calculateMeanGoNoGo(secondHalf) - calculateMeanGoNoGo(firstHalf)) / calculateMeanGoNoGo(firstHalf)) * 100;
  
  // Calculate consistency as inverse of variance
  const mean = calculateMeanGoNoGo(scores);
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const consistency = Math.max(0, 100 - (variance / mean) * 10);

  return {
    improvement: Math.round(improvement),
    consistency: Math.round(consistency)
  };
};

export const calculatePercentileRankingGoNoGo = (
  userProfile: {
    cognitiveProfile: Record<string, {
      trend: Array<{
        metrics: Record<string, number>;
      }>;
    }>;
  },
  aggregateStats: { averageScores: Record<string, Record<string, number>> }
): Record<string, Record<string, number>> => {
  const percentileRanking: Record<string, Record<string, number>> = {};
  
  // Get categories from aggregate stats
  const categories = Object.keys(aggregateStats.averageScores);
  
  categories.forEach(category => {
    percentileRanking[category] = {};
    const metrics = Object.keys(aggregateStats.averageScores[category]);
    
    metrics.forEach(metric => {
      const userScore = userProfile.cognitiveProfile[category].trend.slice(-1)[0]?.metrics[metric] || 0;
      const avgScore = aggregateStats.averageScores[category][metric] || 0;
      
      // Simple percentile calculation based on comparison with average
      if (userScore === 0) {
        percentileRanking[category][metric] = 0;
      } else if (avgScore === 0) {
        percentileRanking[category][metric] = 50;
      } else {
        percentileRanking[category][metric] = Math.round((userScore / avgScore) * 50);
      }
    });
  });
  
  return percentileRanking;
}; 