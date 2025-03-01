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
    viewTimestamps,
    matchTimes,
    matchedPairs
  } = gameState;

  // Memory Metrics
  const memory = {
    accuracy: (matchedPairs.length * 2 / attempts) * 100,
    reactionTime: matchTimes.length > 0 ? calculateMean(matchTimes) : 0,
    span: matchedPairs.length * 2,
    errorRate: (attempts - matchedPairs.length) / attempts * 100
  };

  // Attention Metrics
  const attention = {
    focusScore: calculateFocusScore(memory.accuracy, memory.reactionTime),
    consistency: calculateConsistency(matchTimes),
    deliberationTime: calculateMean(Object.values(viewTimestamps)) / 1000
  };

  // Processing Metrics
  const processing = {
    cognitiveLoad: calculateCognitiveLoad(viewTimestamps, matchTimes, memory.errorRate),
    processingSpeed: matchedPairs.length / (Math.max(...matchTimes) / 60), // matches per minute
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
    confidenceLevel: calculateConfidenceLevel(attempts, matchedPairs.length),
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
  const speedFactor = Math.max(0, 100 - (reactionTime * 10));
  return Math.min(100, (accuracy * 0.6) + (speedFactor * 0.4));
};

const calculateConsistency = (matchTimes: number[]): number => {
  if (matchTimes.length < 2) return 100;
  const variability = calculateStandardDeviation(matchTimes) / calculateMean(matchTimes);
  return Math.max(0, 100 - (variability * 100));
};

const calculateCognitiveLoad = (
  viewTimestamps: Record<string, number>,
  matchTimes: number[],
  errorRate: number
): number => {
  const avgViewTime = calculateMean(Object.values(viewTimestamps));
  const timeVariability = matchTimes.length > 1 
    ? calculateStandardDeviation(matchTimes) / calculateMean(matchTimes)
    : 0;

  const load = (
    (avgViewTime / 1000) * 20 + // View time factor (0-40)
    (errorRate / 2) +           // Error factor (0-30)
    (timeVariability * 30)      // Timing consistency factor (0-30)
  );

  return Math.min(100, Math.max(0, load));
};

const calculateEfficiency = (accuracy: number, reactionTime: number, errorRate: number): number => {
  const speedEfficiency = Math.max(0, 100 - (reactionTime * 5));
  const accuracyEfficiency = accuracy - (errorRate / 2);
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