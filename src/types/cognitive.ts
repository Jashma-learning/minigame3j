export interface NavigationMetrics {
  totalTime: number;
  pathLength: number;
  wrongTurns: number;
  backtracks: number;
  idleTime: number;
  collisions: number;
  correctTurns: number;
  optimalPathLength: number;
}

export interface CognitiveScore {
  spatialMemory: number;    // Efficiency Ratio
  decisionMaking: number;   // Decision Accuracy
  attention: number;        // Focus Score
  overallScore: number;     // Composite Score
}

export interface CognitiveAssessment {
  attempt: number;
  metrics: NavigationMetrics;
  scores: CognitiveScore;
  timestamp: number;
}

export interface CognitiveReport {
  assessments: CognitiveAssessment[];
  averageScores: CognitiveScore;
  improvement: number;
  recommendations: string[];
  percentileRanking: {
    spatialMemory: number;
    decisionMaking: number;
    attention: number;
    overall: number;
  };
} 