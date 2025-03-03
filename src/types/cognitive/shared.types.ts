import { CognitiveMetrics } from './metrics.types';

export interface CognitiveProfile {
  userId: string;
  assessments: {
    timestamp: number;
    metrics: CognitiveMetrics;
  }[];
  trend: {
    improvement: number;
    consistency: number;
  };
  percentileRanking: {
    memory: number;
    attention: number;
    processing: number;
    overall: number;
  };
}

export interface UserProgress {
  userId: string;
  totalAssessments: number;
  averageScore: number;
  lastAssessmentDate: number;
  improvement: number;
}

export interface AggregateStats {
  totalUsers: number;
  averageScores: {
    memory: number;
    attention: number;
    processing: number;
    overall: number;
  };
  distributions: {
    memory: number[];
    attention: number[];
    processing: number[];
    overall: number[];
  };
} 