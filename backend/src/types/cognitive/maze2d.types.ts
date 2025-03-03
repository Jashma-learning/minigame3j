/**
 * Represents a point in the player's path through the maze
 */
export interface PathPoint {
  x: number;
  y: number;
  timestamp: number; // Milliseconds since game start
}

/**
 * Game state for Maze2D
 */
export interface Maze2DGameState {
  path: PathPoint[];
  timeElapsed: number;
  wallCollisions: number;
  revisitedCells: number;
  totalCells: number;
  cellsVisited: number;
  hintsUsed: number;
  difficulty: number;
  completed: boolean;
  optimalPathLength: number;
  actualPathLength: number;
  moveTimes: number[];
  decisionPointTimes: number[];
}

/**
 * Cognitive metrics for Maze2D game
 */
export interface Maze2DMetrics {
  spatialNavigation: {
    pathEfficiency: number;
    explorationCoverage: number;
    spatialMemory: number;
    wayfindingPrecision: number;
    routePlanning: number;
  };
  decisionMaking: {
    decisionSpeed: number;
    decisionConsistency: number;
    explorationStrategy: number;
    adaptiveDecisionMaking: number;
    confidenceLevel: number;
  };
  problemSolving: {
    solutionTime: number;
    hintsReliance: number;
    errorCorrection: number;
    obstacleManagement: number;
    solutionOptimality: number;
  };
  attention: {
    focusMaintenance: number;
    distractionResistance: number;
    attentionalStamina: number;
    vigilanceLevel: number;
    attentionalLapses: number;
  };
  overall: {
    performanceScore: number;
    cognitiveEfficiency: number;
    learningRate: number;
    cognitiveStamina: number;
    compositeScore: number;
  };
}

/**
 * A single assessment from a Maze2D game session
 */
export interface Maze2DAssessment {
  id: string;
  timestamp: string;
  metrics: Maze2DMetrics;
  averageScores: {
    spatialNavigation: number;
    decisionMaking: number;
    problemSolving: number;
    attention: number;
    overall: number;
  };
}

/**
 * Progress tracking for a specific cognitive category
 */
export interface Maze2DProgress {
  timestamp: string;
  score: number;
}

/**
 * Percentile ranking for each cognitive category
 */
export interface Maze2DPercentileRanking {
  spatialNavigation: number;
  decisionMaking: number;
  problemSolving: number;
  attention: number;
  overall: number;
}

/**
 * User data for Maze2D cognitive profile
 */
export interface Maze2DUserData {
  assessments: Maze2DAssessment[];
  progress: {
    spatialNavigation: Maze2DProgress[];
    decisionMaking: Maze2DProgress[];
    problemSolving: Maze2DProgress[];
    attention: Maze2DProgress[];
    overall: Maze2DProgress[];
  };
}

/**
 * Aggregate statistics for distribution data
 */
export interface DistributionDataPoint {
  timestamp: string;
  spatialNavigation: number;
  decisionMaking: number;
  problemSolving: number;
  attention: number;
  overall: number;
}

/**
 * Complete data structure for Maze2D metrics
 */
export interface Maze2DData {
  users: {
    [userId: string]: Maze2DUserData;
  };
  aggregateStats: {
    totalAssessments: number;
    averageScores: {
      spatialNavigation: number;
      decisionMaking: number;
      problemSolving: number;
      attention: number;
      overall: number;
    };
    distributionData: DistributionDataPoint[];
  };
}

/**
 * Response for storing metrics
 */
export interface Maze2DMetricsResponse {
  assessmentId: string;
  timestamp: string;
  averageScores: {
    spatialNavigation: number;
    decisionMaking: number;
    problemSolving: number;
    attention: number;
    overall: number;
  };
}

/**
 * Response for cognitive profile
 */
export interface Maze2DProfileResponse {
  userId: string;
  latestAssessment: Maze2DAssessment;
  progress: {
    spatialNavigation: Maze2DProgress[];
    decisionMaking: Maze2DProgress[];
    problemSolving: Maze2DProgress[];
    attention: Maze2DProgress[];
    overall: Maze2DProgress[];
  };
  percentileRanking: Maze2DPercentileRanking;
  recommendedFocus: string;
} 