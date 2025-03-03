import { 
  StroopMetrics, 
  StroopProgress, 
  StroopPercentileRanking 
} from '../types/cognitive/stroop.types';
import { CognitiveProfile } from '../types/cognitive/shared.types';

/**
 * Calculates the mean of an array of numbers
 * @param numbers - Array of numbers to calculate mean from
 * @returns The mean value or 0 if array is empty
 */
export const calculateMeanStroop = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
};

/**
 * Calculates the standard deviation of an array of numbers
 * @param numbers - Array of numbers to calculate standard deviation from
 * @returns The standard deviation or 0 if array has less than 2 elements
 */
export const calculateStdDevStroop = (numbers: number[]): number => {
  if (numbers.length < 2) return 0;
  const mean = calculateMeanStroop(numbers);
  const squareDiffs = numbers.map(n => Math.pow(n - mean, 2));
  const variance = calculateMeanStroop(squareDiffs);
  return Math.sqrt(variance);
};

/**
 * Calculates progress metrics based on a user's assessment history
 * @param assessments - Array of assessment records
 * @returns Progress metrics including improvement and consistency
 */
export const calculateProgressStroop = (
  assessments: Array<{ timestamp: number; metrics: StroopMetrics }>
): StroopProgress => {
  if (assessments.length < 2) {
    return {
      inhibition: { improvement: 0, consistency: 100 },
      attention: { improvement: 0, consistency: 100 },
      processing: { improvement: 0, consistency: 100 },
      flexibility: { improvement: 0, consistency: 100 },
      overall: { improvement: 0, consistency: 100 }
    };
  }

  // Sort assessments by timestamp (oldest first)
  const sortedAssessments = [...assessments].sort((a, b) => a.timestamp - b.timestamp);
  const first = sortedAssessments[0];
  const last = sortedAssessments[sortedAssessments.length - 1];

  // Calculate improvements for each category
  const inhibitionImprovement = calculateCategoryImprovement(first, last, 'inhibition');
  const attentionImprovement = calculateCategoryImprovement(first, last, 'attention');
  const processingImprovement = calculateCategoryImprovement(first, last, 'processing');
  const flexibilityImprovement = calculateCategoryImprovement(first, last, 'flexibility');
  const overallImprovement = calculateCategoryImprovement(first, last, 'overall');

  // Calculate consistency for each category
  const inhibitionConsistency = calculateCategoryConsistency(sortedAssessments, 'inhibition');
  const attentionConsistency = calculateCategoryConsistency(sortedAssessments, 'attention');
  const processingConsistency = calculateCategoryConsistency(sortedAssessments, 'processing');
  const flexibilityConsistency = calculateCategoryConsistency(sortedAssessments, 'flexibility');
  const overallConsistency = calculateCategoryConsistency(sortedAssessments, 'overall');

  return {
    inhibition: { 
      improvement: Math.round(inhibitionImprovement * 10) / 10, 
      consistency: Math.round(inhibitionConsistency)
    },
    attention: { 
      improvement: Math.round(attentionImprovement * 10) / 10, 
      consistency: Math.round(attentionConsistency)
    },
    processing: { 
      improvement: Math.round(processingImprovement * 10) / 10, 
      consistency: Math.round(processingConsistency)
    },
    flexibility: { 
      improvement: Math.round(flexibilityImprovement * 10) / 10, 
      consistency: Math.round(flexibilityConsistency)
    },
    overall: { 
      improvement: Math.round(overallImprovement * 10) / 10, 
      consistency: Math.round(overallConsistency)
    }
  };
};

/**
 * Helper function to calculate improvement for a specific category
 */
const calculateCategoryImprovement = (
  first: { metrics: StroopMetrics },
  last: { metrics: StroopMetrics },
  category: keyof StroopMetrics
): number => {
  if (category === 'processing') {
    // For processing, combine reaction time improvement (lower is better) and efficiency improvement (higher is better)
    const rtImprovement = (first.metrics[category].averageReactionTime - last.metrics[category].averageReactionTime) / 
      first.metrics[category].averageReactionTime * 100;
      
    const efficiencyImprovement = (last.metrics[category].processingEfficiency - first.metrics[category].processingEfficiency);
    
    return (rtImprovement + efficiencyImprovement) / 2;
  } else if (category === 'inhibition') {
    // For inhibition, combine accuracy improvement and interference reduction
    const accuracyImprovement = (last.metrics[category].accuracy - first.metrics[category].accuracy);
    const interferenceReduction = (first.metrics[category].interference - last.metrics[category].interference);
    
    return (accuracyImprovement + interferenceReduction) / 2;
  } else if (category === 'overall') {
    // For overall, use performance score improvement
    return (last.metrics[category].performanceScore - first.metrics[category].performanceScore);
  } else if (category === 'attention') {
    // For attention, use sustained attention
    return (last.metrics[category].sustainedAttention - first.metrics[category].sustainedAttention);
  } else if (category === 'flexibility') {
    // For flexibility, use adaptive control
    return (last.metrics[category].adaptiveControl - first.metrics[category].adaptiveControl);
  }
  
  return 0; // This should never happen
};

/**
 * Helper function to calculate consistency for a specific category
 */
const calculateCategoryConsistency = (
  assessments: Array<{ metrics: StroopMetrics }>,
  category: keyof StroopMetrics
): number => {
  let scores: number[] = [];
  
  if (category === 'processing') {
    scores = assessments.map(a => a.metrics[category].processingEfficiency);
  } else if (category === 'inhibition') {
    scores = assessments.map(a => a.metrics[category].accuracy);
  } else if (category === 'overall') {
    scores = assessments.map(a => a.metrics[category].performanceScore);
  } else if (category === 'attention') {
    scores = assessments.map(a => a.metrics[category].sustainedAttention);
  } else if (category === 'flexibility') {
    scores = assessments.map(a => a.metrics[category].adaptiveControl);
  }
  
  const stdDev = calculateStdDevStroop(scores);
  const mean = calculateMeanStroop(scores);
  
  if (mean === 0) return 100; // Avoid division by zero
  return Math.max(0, 100 - ((stdDev / mean) * 100));
};

/**
 * Calculates percentile rankings for a user's most recent assessment
 * @param userMetrics - The user's most recent metrics
 * @param allUserMetrics - All users' metrics for comparison
 * @returns Percentile rankings for each category and metric
 */
export const calculatePercentileRankingStroop = (
  userMetrics: StroopMetrics,
  allUserMetrics: StroopMetrics[]
): StroopPercentileRanking => {
  if (allUserMetrics.length === 0) {
    return {
      inhibition: { accuracy: 50, interference: 50, congruentAccuracy: 50, incongruentAccuracy: 50, interferenceEffect: 50 },
      attention: { sustainedAttention: 50, vigilanceLevel: 50, attentionalLapses: 50, focusQuality: 50 },
      processing: { averageReactionTime: 50, congruentReactionTime: 50, incongruentReactionTime: 50, reactionTimeVariability: 50, processingEfficiency: 50 },
      flexibility: { adaptiveControl: 50, switchingCost: 50, errorRecovery: 50, strategyDevelopment: 50 },
      overall: { performanceScore: 50, cognitiveFatigue: 50, consistencyIndex: 50, compositeScore: 50 }
    };
  }

  const categories = ['inhibition', 'attention', 'processing', 'flexibility', 'overall'] as const;
  const result: Record<string, Record<string, number>> = {};
  
  categories.forEach(category => {
    result[category] = {};
    
    // Get all metrics for the current category
    const metrics = Object.keys(userMetrics[category]) as Array<keyof typeof userMetrics[typeof category]>;
    
    metrics.forEach(metric => {
      // Get user's value and all values for this metric
      const userValue = userMetrics[category][metric];
      
      // Extract all values for this metric from all users
      const allValues = allUserMetrics.map(m => m[category][metric]);
      
      // For most metrics, higher is better (except reaction times, interference, lapses, and fatigue)
      const lowerIsBetter = [
        'averageReactionTime',
        'congruentReactionTime', 
        'incongruentReactionTime',
        'reactionTimeVariability',
        'interference',
        'interferenceEffect',
        'attentionalLapses',
        'cognitiveFatigue'
      ].includes(metric as string);
      
      // Count how many values user is better than
      let betterCount = 0;
      
      if (lowerIsBetter) {
        // For these metrics, lower values are better
        betterCount = allValues.filter(value => userValue <= value).length;
      } else {
        // For most metrics, higher values are better
        betterCount = allValues.filter(value => userValue >= value).length;
      }
      
      // Calculate percentile (percentage of people user is better than)
      const percentile = Math.round((betterCount / allValues.length) * 100);
      
      // Store the percentile
      result[category][metric as string] = percentile;
    });
  });
  
  return result as StroopPercentileRanking;
};

/**
 * Calculates a cognitive profile for Stroop metrics
 * @param assessments - Array of assessments to calculate profile from
 * @returns A cognitive profile with baseline and trends
 */
export const calculateStroopProfile = (
  assessments: Array<{ timestamp: number; metrics: StroopMetrics; sessionId: string }>
): {
  inhibition: CognitiveProfile;
  attention: CognitiveProfile;
  processing: CognitiveProfile;
  flexibility: CognitiveProfile;
  overall: CognitiveProfile;
} => {
  if (assessments.length === 0) {
    return {
      inhibition: { baseline: null, trend: [] },
      attention: { baseline: null, trend: [] },
      processing: { baseline: null, trend: [] },
      flexibility: { baseline: null, trend: [] },
      overall: { baseline: null, trend: [] }
    };
  }
  
  // Sort assessments by timestamp
  const sortedAssessments = [...assessments].sort((a, b) => a.timestamp - b.timestamp);
  const firstAssessment = sortedAssessments[0];
  
  // Create trend data for each category
  const trend = sortedAssessments.map(assessment => ({
    timestamp: assessment.timestamp,
    metrics: assessment.metrics
  }));
  
  return {
    inhibition: {
      baseline: firstAssessment.metrics,
      trend
    },
    attention: {
      baseline: firstAssessment.metrics,
      trend
    },
    processing: {
      baseline: firstAssessment.metrics,
      trend
    },
    flexibility: {
      baseline: firstAssessment.metrics,
      trend
    },
    overall: {
      baseline: firstAssessment.metrics,
      trend
    }
  };
}; 