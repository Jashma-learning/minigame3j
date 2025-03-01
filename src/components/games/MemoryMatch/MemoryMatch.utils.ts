import { MemoryMatchMetrics, MemoryMatchGameState } from '../../../types/cognitive/memoryMatch.types';

// Statistical helper functions
const calculateMean = (numbers: number[]): number => 
  numbers.reduce((sum, n) => sum + n, 0) / numbers.length;

const calculateStandardDeviation = (numbers: number[]): number => {
  const mean = calculateMean(numbers);
  const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
  return Math.sqrt(variance);
};

// Calculate trend from a series of numbers (-100 to 100)
const calculateTrend = (numbers: number[]): number => {
  if (numbers.length < 2) return 0;
  
  const first = numbers[0];
  const last = numbers[numbers.length - 1];
  const maxChange = Math.max(Math.abs(first), 100);
  return ((last - first) / maxChange) * 100;
};

export const calculateMemoryMatchMetrics = (gameState: MemoryMatchGameState): MemoryMatchMetrics => {
  const {
    attempts,
    matchedPairs,
    matchTimes,
    viewTimestamps
  } = gameState;

  // Prevent division by zero and ensure valid numbers
  const totalPairs = matchedPairs.length / 2;
  const validMatchTimes = matchTimes.filter(time => !isNaN(time) && time > 0);
  const avgMatchTime = validMatchTimes.length > 0 ? calculateMean(validMatchTimes) : 0;

  // Memory Metrics
  const memory = {
    accuracy: attempts > 0 ? (totalPairs / attempts) * 100 : 0,
    reactionTime: avgMatchTime || 0,
    span: matchedPairs.length,
    errorRate: attempts > 0 ? ((attempts - totalPairs) / attempts) * 100 : 0
  };

  // Calculate valid view times
  const validViewTimes = Object.values(viewTimestamps)
    .filter(time => !isNaN(time) && time > 0)
    .map(time => time / 1000); // Convert to seconds

  // Attention Metrics
  const attention = {
    focusScore: calculateFocusScore(memory.accuracy, memory.reactionTime),
    consistency: validMatchTimes.length > 1 ? calculateConsistency(validMatchTimes) : 100,
    deliberationTime: validViewTimes.length > 0 ? calculateMean(validViewTimes) : 0
  };

  // Processing Metrics
  const processing = {
    cognitiveLoad: calculateCognitiveLoad(validViewTimes, validMatchTimes, memory.errorRate),
    processingSpeed: avgMatchTime > 0 ? (totalPairs / avgMatchTime) * 60 : 0, // matches per minute
    efficiency: calculateEfficiency(memory.accuracy, memory.reactionTime, memory.errorRate)
  };

  // Performance Trends
  const trends = {
    accuracyTrend: calculateTrend(matchTimes.map((_, i) => 
      (matchedPairs.slice(0, i + 1).length * 2 / (i + 1)) * 100
    )),
    speedTrend: calculateTrend(matchTimes),
    learningRate: calculateLearningRate(matchTimes, memory.errorRate)
  };

  // Overall Assessment
  const overall = {
    performanceScore: calculatePerformanceScore(memory, attention, processing),
    confidenceLevel: calculateConfidenceLevel(attempts, totalPairs),
    percentileRank: calculatePercentileRank(memory.accuracy, memory.reactionTime)
  };

  return {
    memory,
    attention,
    processing,
    trends,
    overall
  };
};

// Helper calculation functions
const calculateFocusScore = (accuracy: number, reactionTime: number): number => {
  if (isNaN(accuracy) || isNaN(reactionTime) || reactionTime <= 0) return 0;
  const speedFactor = Math.max(0, 100 - (reactionTime * 10));
  return Math.min(100, (accuracy * 0.6) + (speedFactor * 0.4));
};

const calculateConsistency = (matchTimes: number[]): number => {
  if (matchTimes.length < 2) return 100;
  const validTimes = matchTimes.filter(time => !isNaN(time) && time > 0);
  if (validTimes.length < 2) return 100;
  const variability = calculateStandardDeviation(validTimes) / calculateMean(validTimes);
  return Math.max(0, Math.min(100, 100 - (variability * 100)));
};

const calculateCognitiveLoad = (
  viewTimes: number[],
  matchTimes: number[],
  errorRate: number
): number => {
  if (viewTimes.length === 0 || matchTimes.length === 0) return 0;
  
  const avgViewTime = calculateMean(viewTimes);
  const timeVariability = matchTimes.length > 1 
    ? calculateStandardDeviation(matchTimes) / calculateMean(matchTimes)
    : 0;

  const load = (
    (avgViewTime * 20) +     // View time factor (0-40)
    (errorRate / 2) +        // Error factor (0-50)
    (timeVariability * 10)   // Timing consistency factor (0-10)
  );

  return Math.max(0, Math.min(100, load));
};

const calculateEfficiency = (accuracy: number, reactionTime: number, errorRate: number): number => {
  if (isNaN(accuracy) || isNaN(reactionTime) || isNaN(errorRate)) return 0;
  if (reactionTime <= 0) return 0;
  
  const speedEfficiency = Math.max(0, 100 - (reactionTime * 5));
  const accuracyEfficiency = Math.max(0, accuracy - (errorRate / 2));
  return Math.min(100, Math.max(0, (speedEfficiency + accuracyEfficiency) / 2));
};

const calculateLearningRate = (matchTimes: number[], errorRate: number): number => {
  if (matchTimes.length < 2) return 0;
  const timeImprovement = (matchTimes[0] - matchTimes[matchTimes.length - 1]) / matchTimes[0];
  return Math.min(100, Math.max(0, (timeImprovement * 50) + (50 - errorRate / 2)));
};

const calculatePerformanceScore = (
  memory: MemoryMatchMetrics['memory'],
  attention: MemoryMatchMetrics['attention'],
  processing: MemoryMatchMetrics['processing']
): number => {
  return Math.min(100, (
    memory.accuracy * 0.3 +
    attention.focusScore * 0.3 +
    processing.efficiency * 0.4
  ));
};

const calculateConfidenceLevel = (attempts: number, matchedPairs: number): number => {
  const minAttempts = matchedPairs * 2; // Minimum possible attempts
  const confidence = Math.min(100, (minAttempts / attempts) * 100);
  return Math.max(50, confidence); // Minimum confidence of 50%
};

const calculatePercentileRank = (accuracy: number, reactionTime: number): number => {
  // Simplified percentile calculation - can be enhanced with actual population data
  const speedPercentile = Math.max(0, 100 - (reactionTime * 10));
  const accuracyPercentile = accuracy;
  return Math.min(100, (speedPercentile + accuracyPercentile) / 2);
};

export const calculateMatchTime = (
  firstViewTimestamp: number,
  matchTimestamp: number
): number => {
  return (matchTimestamp - firstViewTimestamp) / 1000; // Convert to seconds
};

export const isSequentialMatch = (
  currentPair: string[],
  previousPair: string[] | null
): boolean => {
  if (!previousPair || currentPair.length !== 2 || previousPair.length !== 2) {
    return false;
  }

  // Check if current pair follows previous pair in sequence
  const currentMin = Math.min(parseInt(currentPair[0]), parseInt(currentPair[1]));
  const previousMin = Math.min(parseInt(previousPair[0]), parseInt(previousPair[1]));
  
  return currentMin === previousMin + 1;
};

export const updateAccuracyHistory = (
  accuracyHistory: number[],
  attempts: number,
  correctMatches: number
): number[] => {
  const currentAccuracy = (correctMatches / attempts) * 100;
  return [...accuracyHistory, currentAccuracy];
}; 