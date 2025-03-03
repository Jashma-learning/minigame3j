export interface CognitiveProfile {
  baseline: any | null; // Base metrics from first assessment
  trend: Array<{
    timestamp: number;
    metrics: any;
  }>;
}

export interface UserProgress {
  improvement: number;
  consistency: number;
}

export interface AggregateStats {
  totalAssessments: number;
  averageScores: Record<string, Record<string, number>>;
} 