/**
 * Core game state for tracking memory match performance
 */
export interface MemoryMatchGameState {
  /** Currently selected pair of cards */
  currentPair: string[];
  
  /** Successfully matched pairs */
  matchedPairs: string[];
  
  /** Total number of attempts made */
  attempts: number;
  
  /** Record of when each card was first viewed */
  viewTimestamps: Record<string, number>;
  
  /** Time taken for each successful match */
  matchTimes: number[];
}

// Base metric types for cognitive assessments
export interface BaseMetric {
  timestamp: number;
  value: number;
}

// Memory Match Game Metrics
export interface MemoryMatchMetrics {
  memory: {
    accuracy: number;
    reactionTime: number;
    span: number;
    errorRate: number;
  };
  attention: {
    focusScore: number;
    consistency: number;
    deliberationTime: number;
  };
  processing: {
    cognitiveLoad: number;
    processingSpeed: number;
    efficiency: number;
  };
  trends?: {
    accuracyTrend: number;
    speedTrend: number;
    learningRate: number;
  };
  overall: {
    performanceScore: number;
    confidenceLevel: number;
    percentileRank: number;
  };
}

// API response types
export interface MemoryMatchMetricsResponse {
  message: string;
  assessmentId: string;
}

export interface MemoryMatchProfileResponse {
  cognitiveProfile: {
    memory: {
      baseline: MemoryMatchMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: MemoryMatchMetrics;
      }>;
    };
    attention: {
      baseline: MemoryMatchMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: MemoryMatchMetrics;
      }>;
    };
    processing: {
      baseline: MemoryMatchMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: MemoryMatchMetrics;
      }>;
    };
    overall: {
      baseline: MemoryMatchMetrics | null;
      trend: Array<{
        timestamp: number;
        metrics: MemoryMatchMetrics;
      }>;
    };
  };
  recentAssessments: Array<{
    timestamp: number;
    metrics: MemoryMatchMetrics;
    sessionId: string;
  }>;
  progress: {
    memory: { improvement: number; consistency: number };
    attention: { improvement: number; consistency: number };
    processing: { improvement: number; consistency: number };
    overall: { improvement: number; consistency: number };
  };
  percentileRanking: {
    memory: Record<string, number>;
    attention: Record<string, number>;
    processing: Record<string, number>;
    overall: Record<string, number>;
  };
} 