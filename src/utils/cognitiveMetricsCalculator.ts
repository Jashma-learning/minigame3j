import { BaseMetric, CognitiveMetrics } from '../types/cognitive/metrics.types';

export const calculateCognitiveMetrics = (metrics: BaseMetric[]): CognitiveMetrics => {
  if (metrics.length === 0) {
    return {
      memory: {
        accuracy: 0,
        reactionTime: 0,
        span: 0,
        errorRate: 0
      },
      attention: {
        focusScore: 0,
        consistency: 0,
        deliberationTime: 0
      },
      processing: {
        cognitiveLoad: 0,
        processingSpeed: 0,
        efficiency: 0
      },
      overall: {
        performanceScore: 0,
        confidenceLevel: 0,
        percentileRank: 0
      }
    };
  }

  // Calculate basic statistics
  const values = metrics.map(m => m.value);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);

  // Calculate time-based metrics
  const timeSpan = metrics[metrics.length - 1].timestamp - metrics[0].timestamp;
  const averageInterval = timeSpan / (metrics.length - 1);

  // Memory metrics
  const memory = {
    accuracy: calculateAccuracy(values),
    reactionTime: averageInterval,
    span: metrics.length,
    errorRate: calculateErrorRate(values)
  };

  // Attention metrics
  const attention = {
    focusScore: calculateFocusScore(values, timeSpan),
    consistency: calculateConsistency(values, mean, std),
    deliberationTime: averageInterval
  };

  // Processing metrics
  const processing = {
    cognitiveLoad: calculateCognitiveLoad(values, timeSpan),
    processingSpeed: 1000 / averageInterval, // Responses per second
    efficiency: calculateEfficiency(values, timeSpan)
  };

  // Overall metrics
  const overall = {
    performanceScore: calculatePerformanceScore(memory, attention, processing),
    confidenceLevel: calculateConfidenceLevel(values, mean, std),
    percentileRank: 50 // Default to median, would need population data for true percentile
  };

  return {
    memory,
    attention,
    processing,
    overall
  };
};

// Helper functions for metric calculations
const calculateAccuracy = (values: number[]): number => {
  const correctResponses = values.filter(v => v > 0).length;
  return (correctResponses / values.length) * 100;
};

const calculateErrorRate = (values: number[]): number => {
  const errors = values.filter(v => v < 0).length;
  return (errors / values.length) * 100;
};

const calculateFocusScore = (values: number[], timeSpan: number): number => {
  const consistencyFactor = 1 - (Math.abs(Math.max(...values) - Math.min(...values)) / Math.max(...values));
  const timeFactor = Math.min(1, timeSpan / (5 * 60 * 1000)); // Normalize to 5 minutes
  return (consistencyFactor * 0.7 + timeFactor * 0.3) * 100;
};

const calculateConsistency = (values: number[], mean: number, std: number): number => {
  const cv = std / mean; // Coefficient of variation
  return Math.max(0, (1 - cv) * 100);
};

const calculateCognitiveLoad = (values: number[], timeSpan: number): number => {
  const complexity = Math.log(values.length) / Math.log(2); // Log base 2 of number of responses
  const timePressure = Math.min(1, timeSpan / (5 * 60 * 1000)); // Normalize to 5 minutes
  return (complexity * 0.6 + timePressure * 0.4) * 100;
};

const calculateEfficiency = (values: number[], timeSpan: number): number => {
  const correctResponses = values.filter(v => v > 0).length;
  const responsesPerSecond = correctResponses / (timeSpan / 1000);
  return Math.min(100, responsesPerSecond * 20); // Scale to 0-100
};

const calculatePerformanceScore = (
  memory: CognitiveMetrics['memory'],
  attention: CognitiveMetrics['attention'],
  processing: CognitiveMetrics['processing']
): number => {
  return (
    memory.accuracy * 0.3 +
    attention.focusScore * 0.3 +
    processing.efficiency * 0.4
  );
};

const calculateConfidenceLevel = (values: number[], mean: number, std: number): number => {
  const zScore = Math.abs(mean / (std || 1)); // Z-score from standard normal distribution
  return Math.min(100, zScore * 25); // Scale to 0-100
}; 