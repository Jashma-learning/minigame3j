import { CognitiveProfile } from './shared.types';

/**
 * Stroop Challenge metrics types
 */

/**
 * StroopMetrics interface - Defines the structure of metrics for the Stroop Challenge
 */
export interface StroopMetrics {
  inhibition: {
    accuracy: number;                  // Overall response accuracy (%)
    interference: number;              // Cognitive interference score (%)
    congruentAccuracy: number;         // Accuracy on congruent trials (%)
    incongruentAccuracy: number;       // Accuracy on incongruent trials (%)
    interferenceEffect: number;        // Difference in RT between congruent and incongruent trials
  };
  attention: {
    sustainedAttention: number;        // Ability to maintain attention over time (%)
    vigilanceLevel: number;            // Alertness and readiness to respond (%)
    attentionalLapses: number;         // Number of very slow responses
    focusQuality: number;              // Consistency in response patterns (%)
  };
  processing: {
    averageReactionTime: number;       // Mean response time for all trials (ms)
    congruentReactionTime: number;     // Mean response time for congruent trials (ms)
    incongruentReactionTime: number;   // Mean response time for incongruent trials (ms)
    reactionTimeVariability: number;   // Standard deviation of response times (ms)
    processingEfficiency: number;      // Speed-accuracy trade-off measure (%)
  };
  flexibility: {
    adaptiveControl: number;           // Ability to adjust to changing demands (%)
    switchingCost: number;             // Performance cost when switching between trial types
    errorRecovery: number;             // How quickly performance recovers after errors (%)
    strategyDevelopment: number;       // Evidence of strategy improvement over time (%)
  };
  overall: {
    performanceScore: number;          // Overall game performance score (%)
    cognitiveFatigue: number;          // Measure of performance degradation (%)
    consistencyIndex: number;          // Overall consistency in responses (%)
    compositeScore: number;            // Weighted combination of all metrics (%)
  };
}

/**
 * Assessment with environment factors
 */
export interface StroopAssessment {
  sessionId: string;
  timestamp: number;
  metrics: StroopMetrics;
  environmentFactors?: {
    timeOfDay: number;  // hour of day (0-23)
    dayOfWeek: number;  // day of week (0-6, 0 being Sunday)
    completionTime: number; // time to complete in ms
  };
}

/**
 * Progress tracking for each category
 */
export interface StroopProgress {
  inhibition: { improvement: number; consistency: number };
  attention: { improvement: number; consistency: number };
  processing: { improvement: number; consistency: number };
  flexibility: { improvement: number; consistency: number };
  overall: { improvement: number; consistency: number };
}

/**
 * Percentile ranking compared to other users
 */
export interface StroopPercentileRanking {
  [category: string]: {
    [metric: string]: number;
  };
}

/**
 * StroopUserData interface - User-specific data for the Stroop Challenge
 */
export interface StroopUserData {
  assessments: StroopAssessment[];
  progress: StroopProgress;
  percentileRanking: StroopPercentileRanking;
  cognitiveProfile: {
    inhibition: CognitiveProfile;
    attention: CognitiveProfile;
    processing: CognitiveProfile;
    flexibility: CognitiveProfile;
    overall: CognitiveProfile;
  };
}

/**
 * StroopData interface - The entire Stroop data file
 */
export interface StroopData {
  users: {
    [userId: string]: StroopUserData;
  };
  aggregateStats: {
    totalAssessments: number;
    averageScores: {
      inhibition: { accuracy: number; interference: number };
      attention: { sustainedAttention: number; vigilanceLevel: number };
      processing: { averageReactionTime: number; processingEfficiency: number };
      flexibility: { adaptiveControl: number; errorRecovery: number };
      overall: { performanceScore: number; compositeScore: number };
    };
  };
}

/**
 * StroopMetricsResponse interface - Response from the metrics API
 */
export interface StroopMetricsResponse {
  userId: string;
  sessionId: string;
  timestamp: number;
  metrics: StroopMetrics;
  progress: StroopProgress;
  percentileRanking: StroopPercentileRanking;
} 