/**
 * Core game state for tracking Stroop Challenge performance
 */
export interface StroopGameState {
  /** All responses captured during gameplay */
  responses: Array<{
    stimulusType: 'congruent' | 'incongruent'; // Whether the color word matches the displayed color
    responseTime: number;                      // Time taken to respond in ms
    wasCorrect: boolean;                       // Whether the response was correct
    wordShown: string;                         // The text of the word shown
    colorShown: string;                        // The color in which the word was displayed
    userResponse: string;                      // The color the user selected
  }>;
  
  /** Total rounds completed */
  totalRounds: number;
  
  /** Current difficulty level */
  currentDifficulty: number;
  
  /** Current streak of correct answers */
  streak: number;
}

// Base metric types for cognitive assessments
export interface BaseMetric {
  timestamp: number;
  value: number;
}

// Stroop Challenge Game Metrics
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

// API response types
export interface StroopMetricsResponse {
  success: boolean;
  message: string;
  assessmentId: string;
}

export interface StroopProfileResponse {
  cognitiveProfile: {
    inhibition: {
      baseline: StroopMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: StroopMetrics;
      }>;
    };
    attention: {
      baseline: StroopMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: StroopMetrics;
      }>;
    };
    processing: {
      baseline: StroopMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: StroopMetrics;
      }>;
    };
    flexibility: {
      baseline: StroopMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: StroopMetrics;
      }>;
    };
    overall: {
      baseline: StroopMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: StroopMetrics;
      }>;
    };
  };
  recentAssessments: Array<{
    timestamp: number;
    metrics: StroopMetrics;
    sessionId: string;
  }>;
  progress: {
    inhibition: { improvement: number; consistency: number };
    attention: { improvement: number; consistency: number };
    processing: { improvement: number; consistency: number };
    flexibility: { improvement: number; consistency: number };
    overall: { improvement: number; consistency: number };
  };
  percentileRanking: {
    inhibition: Record<string, number>;
    attention: Record<string, number>;
    processing: Record<string, number>;
    flexibility: Record<string, number>;
    overall: Record<string, number>;
  };
} 