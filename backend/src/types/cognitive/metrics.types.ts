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
  overall: {
    performanceScore: number;
    confidenceLevel: number;
    percentileRank: number;
  };
}

// Assessment data structure
export interface Assessment {
  timestamp: number;
  metrics: MemoryMatchMetrics;
  sessionId: string;
  environmentFactors: {
    timeOfDay: number;
    dayOfWeek: number;
    completionTime: number;
  };
}

// User profile data structure
export interface CognitiveProfile {
  baseline: MemoryMatchMetrics | null;
  trend: Array<{
    timestamp: number;
    metrics: MemoryMatchMetrics;
  }>;
}

export interface UserProfile {
  assessments: Assessment[];
  cognitiveProfile: {
    memory: CognitiveProfile;
    attention: CognitiveProfile;
    processing: CognitiveProfile;
    overall: CognitiveProfile;
  };
}

// Aggregate statistics
export interface AggregateStats {
  totalAssessments: number;
  averageScores: MemoryMatchMetrics;
}

// Complete data structure for memory match game
export interface MemoryMatchData {
  users: Record<string, UserProfile>;
  aggregateStats: AggregateStats;
}

// Helper function to create a new metric
export const createMetric = (value: number): BaseMetric => ({
  timestamp: Date.now(),
  value
});

export interface MetricValue {
  accuracy: number;
  reactionTime: number;
  span: number;
  errorRate: number;
}

export interface AttentionMetrics {
  focusScore: number;
  consistency: number;
  deliberationTime: number;
}

export interface ProcessingMetrics {
  cognitiveLoad: number;
  processingSpeed: number;
  efficiency: number;
}

export interface OverallMetrics {
  performanceScore: number;
  confidenceLevel: number;
  percentileRank: number;
} 