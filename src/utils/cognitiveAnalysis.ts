import { NavigationMetrics, CognitiveScore, CognitiveReport, CognitiveAssessment } from '@/types/cognitive';

// Normative data (these would typically be based on large-scale studies)
const NORMATIVE_DATA = {
  spatialMemory: { mean: 0.7, stdDev: 0.15 },
  decisionMaking: { mean: 0.75, stdDev: 0.12 },
  attention: { mean: 0.8, stdDev: 0.1 }
};

export function calculateCognitiveScores(metrics: NavigationMetrics): CognitiveScore {
  // Calculate Spatial Memory (Efficiency Ratio)
  const spatialMemory = Math.min(
    metrics.optimalPathLength / Math.max(metrics.pathLength, 1),
    1
  );

  // Calculate Decision Making Accuracy
  const totalDecisions = metrics.wrongTurns + metrics.correctTurns;
  const decisionMaking = totalDecisions > 0 
    ? metrics.correctTurns / totalDecisions 
    : 0;

  // Calculate Attention Score
  const totalTime = Math.max(metrics.totalTime, 1);
  const attention = (totalTime - metrics.idleTime) / totalTime;

  // Calculate Overall Score (weighted average)
  const overallScore = (
    spatialMemory * 0.35 +
    decisionMaking * 0.35 +
    attention * 0.3
  ) * 100;

  return {
    spatialMemory: spatialMemory * 100,
    decisionMaking: decisionMaking * 100,
    attention: attention * 100,
    overallScore
  };
}

// Error function implementation (since Math.erf is not available in all environments)
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

function calculatePercentile(value: number, mean: number, stdDev: number): number {
  const zScore = (value / 100 - mean) / stdDev;
  // Approximate normal distribution percentile
  return Math.min(Math.max(
    (1 + erf(zScore / Math.sqrt(2))) / 2 * 100,
    1
  ), 99);
}

export function generateCognitiveReport(assessments: CognitiveAssessment[]): CognitiveReport {
  if (assessments.length === 0) {
    throw new Error('No assessments available');
  }

  // Calculate average scores
  const averageScores: CognitiveScore = {
    spatialMemory: 0,
    decisionMaking: 0,
    attention: 0,
    overallScore: 0
  };

  assessments.forEach(assessment => {
    averageScores.spatialMemory += assessment.scores.spatialMemory;
    averageScores.decisionMaking += assessment.scores.decisionMaking;
    averageScores.attention += assessment.scores.attention;
    averageScores.overallScore += assessment.scores.overallScore;
  });

  const count = assessments.length;
  averageScores.spatialMemory /= count;
  averageScores.decisionMaking /= count;
  averageScores.attention /= count;
  averageScores.overallScore /= count;

  // Calculate improvement (comparing last to first attempt)
  const improvement = assessments.length > 1
    ? ((assessments[assessments.length - 1].scores.overallScore -
        assessments[0].scores.overallScore) /
       assessments[0].scores.overallScore) * 100
    : 0;

  // Calculate percentile rankings
  const percentileRanking = {
    spatialMemory: calculatePercentile(
      averageScores.spatialMemory,
      NORMATIVE_DATA.spatialMemory.mean,
      NORMATIVE_DATA.spatialMemory.stdDev
    ),
    decisionMaking: calculatePercentile(
      averageScores.decisionMaking,
      NORMATIVE_DATA.decisionMaking.mean,
      NORMATIVE_DATA.decisionMaking.stdDev
    ),
    attention: calculatePercentile(
      averageScores.attention,
      NORMATIVE_DATA.attention.mean,
      NORMATIVE_DATA.attention.stdDev
    ),
    overall: 0
  };
  
  percentileRanking.overall = (
    percentileRanking.spatialMemory +
    percentileRanking.decisionMaking +
    percentileRanking.attention
  ) / 3;

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (averageScores.spatialMemory < 70) {
    recommendations.push(
      'Consider exercises to improve spatial memory, such as mental mapping and visualization tasks.'
    );
  }
  
  if (averageScores.decisionMaking < 70) {
    recommendations.push(
      'Focus on strategic planning and decision-making exercises to enhance problem-solving abilities.'
    );
  }
  
  if (averageScores.attention < 70) {
    recommendations.push(
      'Practice mindfulness and concentration exercises to improve attention span and focus.'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Great performance! Continue challenging yourself with more complex spatial and cognitive tasks.'
    );
  }

  return {
    assessments,
    averageScores,
    improvement,
    recommendations,
    percentileRanking
  };
} 