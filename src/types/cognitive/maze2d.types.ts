import { CognitiveProfile } from './shared.types';

/**
 * Maze2D Game State interface - Raw gameplay data
 */
export interface Maze2DGameState {
  /** Path taken by the player through the maze */
  path: Array<{
    x: number;
    y: number;
    timestamp: number;
  }>;
  
  /** Time elapsed in milliseconds */
  timeElapsed: number;
  
  /** Number of times the player hit a wall */
  wallCollisions: number;
  
  /** Number of times the player visited the same cell */
  revisitedCells: number;
  
  /** Total number of cells in the maze */
  totalCells: number;
  
  /** Number of cells visited */
  cellsVisited: number;
  
  /** Number of times the player requested a hint */
  hintsUsed: number;
  
  /** Difficulty level (maze size and complexity) */
  difficulty: number;
  
  /** Whether the maze was completed */
  completed: boolean;
  
  /** Distance (in cells) of the optimal path from start to finish */
  optimalPathLength: number;
  
  /** Actual distance traveled by the player */
  actualPathLength: number;
  
  /** Time intervals between moves */
  moveTimes: number[];
  
  /** Time spent on decision points (junctions) */
  decisionPointTimes: number[];
}

/**
 * Maze2D Metrics interface - Processed cognitive metrics
 */
export interface Maze2DMetrics {
  spatialNavigation: {
    pathEfficiency: number;        // Ratio of optimal path to actual path (%)
    explorationCoverage: number;   // Percentage of maze explored (%)
    spatialMemory: number;         // Ability to avoid revisiting (%)
    wayfindingPrecision: number;   // Accuracy in navigating without wall collisions (%)
    routePlanning: number;         // Strategic path planning ability (%)
  };
  decisionMaking: {
    decisionSpeed: number;         // Average time to make navigational decisions (ms)
    decisionConsistency: number;   // Consistency in decision-making (%)
    explorationStrategy: number;   // Evidence of systematic exploration (%)
    adaptiveDecisionMaking: number;// Ability to adapt decisions based on feedback (%)
    confidenceLevel: number;       // Confidence in navigation decisions (%)
  };
  problemSolving: {
    solutionTime: number;          // Time to complete the maze (ms)
    hintsReliance: number;         // Reliance on hints (lower is better) (%)
    errorCorrection: number;       // Speed of correcting navigational errors (%)
    obstacleManagement: number;    // Efficiency in handling obstacles (%)
    solutionOptimality: number;    // How close to optimal solution (%)
  };
  attention: {
    focusMaintenance: number;      // Consistency in movement and decision speed (%)
    distractionResistance: number; // Ability to stay on task without wandering (%)
    attentionalStamina: number;    // Maintenance of focus throughout the task (%)
    vigilanceLevel: number;        // Awareness of surroundings and opportunities (%)
    attentionalLapses: number;     // Number of apparent attention failures
  };
  overall: {
    performanceScore: number;      // Overall maze performance score (%)
    cognitiveEfficiency: number;   // Balance of speed and accuracy (%)
    learningRate: number;          // Improvement over multiple mazes (%)
    cognitiveStamina: number;      // Resistance to cognitive fatigue (%)
    compositeScore: number;        // Overall cognitive ability score (%)
  };
}

/**
 * Assessment with environment factors
 */
export interface Maze2DAssessment {
  sessionId: string;
  timestamp: number;
  metrics: Maze2DMetrics;
  environmentFactors?: {
    timeOfDay: number;  // hour of day (0-23)
    dayOfWeek: number;  // day of week (0-6, 0 being Sunday)
    completionTime: number; // time to complete in ms
  };
}

/**
 * Progress tracking for each category
 */
export interface Maze2DProgress {
  spatialNavigation: { improvement: number; consistency: number };
  decisionMaking: { improvement: number; consistency: number };
  problemSolving: { improvement: number; consistency: number };
  attention: { improvement: number; consistency: number };
  overall: { improvement: number; consistency: number };
}

/**
 * Percentile ranking compared to other users
 */
export interface Maze2DPercentileRanking {
  [category: string]: {
    [metric: string]: number;
  };
}

/**
 * Maze2DUserData interface - User-specific data for the Maze2D game
 */
export interface Maze2DUserData {
  assessments: Maze2DAssessment[];
  progress: Maze2DProgress;
  percentileRanking: Maze2DPercentileRanking;
  cognitiveProfile: {
    spatialNavigation: CognitiveProfile;
    decisionMaking: CognitiveProfile;
    problemSolving: CognitiveProfile;
    attention: CognitiveProfile;
    overall: CognitiveProfile;
  };
}

/**
 * Maze2DData interface - The entire Maze2D data file
 */
export interface Maze2DData {
  users: {
    [userId: string]: Maze2DUserData;
  };
  aggregateStats: {
    totalAssessments: number;
    averageScores: {
      spatialNavigation: { pathEfficiency: number; explorationCoverage: number };
      decisionMaking: { decisionSpeed: number; explorationStrategy: number };
      problemSolving: { solutionTime: number; solutionOptimality: number };
      attention: { focusMaintenance: number; attentionalStamina: number };
      overall: { performanceScore: number; compositeScore: number };
    };
  };
}

/**
 * Maze2DMetricsResponse interface - Response from the metrics API
 */
export interface Maze2DMetricsResponse {
  userId: string;
  sessionId: string;
  timestamp: number;
  metrics: Maze2DMetrics;
  progress: Maze2DProgress;
  percentileRanking: Maze2DPercentileRanking;
}

/**
 * Profile response with extended data
 */
export interface Maze2DProfileResponse {
  userId: string;
  profile: {
    spatialNavigation: CognitiveProfile;
    decisionMaking: CognitiveProfile;
    problemSolving: CognitiveProfile;
    attention: CognitiveProfile;
    overall: CognitiveProfile;
  };
  progress: Maze2DProgress;
  percentileRanking: Maze2DPercentileRanking;
} 