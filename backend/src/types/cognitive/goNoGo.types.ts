import { CognitiveProfile } from './shared.types';

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

export interface GoNoGoGameState {
  totalRounds: number;
  responses: Array<{
    timestamp: number;
    stimulusType: 'go' | 'no-go';
    responseTime: number;
    wasCorrect: boolean;
    speed: number;
  }>;
  streak: number;
  currentSpeed: number;
  score: number;
}

export interface GoNoGoMetricsResponse {
  success: boolean;
  message: string;
  assessmentId: string;
}

export interface GoNoGoProfileResponse {
  success: boolean;
  data: {
    cognitiveProfile: {
      inhibition: CognitiveProfile;
      attention: CognitiveProfile;
      processing: CognitiveProfile;
      learning: CognitiveProfile;
      overall: CognitiveProfile;
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
  };
} 