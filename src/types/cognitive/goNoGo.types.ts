/**
 * Core game state for tracking Go/No-Go performance
 */
export interface GoNoGoGameState {
  /** Total number of rounds played */
  totalRounds: number;
  
  /** Record of each response */
  responses: Array<{
    timestamp: number;
    stimulusType: 'go' | 'no-go';
    responseTime: number;
    wasCorrect: boolean;
    speed: number;
  }>;
  
  /** Current streak of correct responses */
  streak: number;
  
  /** Current game speed in milliseconds */
  currentSpeed: number;
  
  /** Score accumulation */
  score: number;
}

// Base metric types for cognitive assessments
export interface BaseMetric {
  timestamp: number;
  value: number;
}

// Go/No-Go Game Metrics
export interface GoNoGoMetrics {
  inhibition: {
    accuracy: number;        // Overall accuracy in inhibiting responses
    noGoAccuracy: number;    // Accuracy specifically for no-go trials
    goAccuracy: number;      // Accuracy specifically for go trials
    falseAlarms: number;     // Number of incorrect responses to no-go stimuli
    missedGoes: number;      // Number of missed go stimuli
  };
  attention: {
    sustainedAttention: number;  // Ability to maintain attention over time
    vigilanceLevel: number;      // Alertness and readiness to respond
    attentionalLapses: number;   // Number of very slow responses
    focusQuality: number;        // Consistency in response patterns
  };
  processing: {
    averageReactionTime: number;    // Mean response time for correct go trials
    reactionTimeVariability: number; // Standard deviation of response times
    processingEfficiency: number;    // Speed-accuracy trade-off measure
    adaptiveControl: number;         // Ability to adjust to changing speeds
  };
  learning: {
    learningRate: number;           // Rate of improvement over trials
    errorCorrectionSpeed: number;   // How quickly errors are corrected
    adaptationQuality: number;      // Quality of adaptation to game demands
    performanceStability: number;   // Stability of performance over time
  };
  overall: {
    performanceScore: number;       // Overall game performance score
    cognitiveFatigue: number;       // Measure of performance degradation
    consistencyIndex: number;       // Overall consistency in responses
    compositeScore: number;         // Weighted combination of all metrics
  };
}

// API response types
export interface GoNoGoMetricsResponse {
  message: string;
  assessmentId: string;
}

export interface GoNoGoProfileResponse {
  cognitiveProfile: {
    inhibition: {
      baseline: GoNoGoMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: GoNoGoMetrics;
      }>;
    };
    attention: {
      baseline: GoNoGoMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: GoNoGoMetrics;
      }>;
    };
    processing: {
      baseline: GoNoGoMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: GoNoGoMetrics;
      }>;
    };
    learning: {
      baseline: GoNoGoMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: GoNoGoMetrics;
      }>;
    };
    overall: {
      baseline: GoNoGoMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: GoNoGoMetrics;
      }>;
    };
  };
  recentAssessments: Array<{
    timestamp: number;
    metrics: GoNoGoMetrics;
    sessionId: string;
  }>;
  progress: {
    inhibition: { improvement: number; consistency: number };
    attention: { improvement: number; consistency: number };
    processing: { improvement: number; consistency: number };
    learning: { improvement: number; consistency: number };
    overall: { improvement: number; consistency: number };
  };
  percentileRanking: {
    inhibition: Record<string, number>;
    attention: Record<string, number>;
    processing: Record<string, number>;
    learning: Record<string, number>;
    overall: Record<string, number>;
  };
} 