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

/**
 * Comprehensive cognitive metrics for memory assessment
 */
export interface MemoryMatchMetrics {
  /** Core Memory Metrics */
  memory: {
    /** Percentage of correct matches (0-100) */
    accuracy: number;
    
    /** Average time to make successful matches (seconds) */
    reactionTime: number;
    
    /** Total number of cards successfully remembered */
    span: number;
    
    /** Percentage of incorrect matches (0-100) */
    errorRate: number;
  };

  /** Attention Metrics */
  attention: {
    /** Overall focus score (0-100) */
    focusScore: number;
    
    /** Consistency in response times (0-100, higher is more consistent) */
    consistency: number;
    
    /** Time spent analyzing cards before making decisions (seconds) */
    deliberationTime: number;
  };

  /** Cognitive Processing */
  processing: {
    /** Mental effort required (0-100) */
    cognitiveLoad: number;
    
    /** Speed of visual processing (matches per minute) */
    processingSpeed: number;
    
    /** Efficiency of matching strategy (0-100) */
    efficiency: number;
  };

  /** Performance Trends */
  trends: {
    /** Change in accuracy over time (-100 to 100) */
    accuracyTrend: number;
    
    /** Change in speed over time (-100 to 100) */
    speedTrend: number;
    
    /** Learning curve steepness (0-100) */
    learningRate: number;
  };

  /** Overall Assessment */
  overall: {
    /** Composite cognitive performance score (0-100) */
    performanceScore: number;
    
    /** Confidence level in the assessment (0-100) */
    confidenceLevel: number;
    
    /** Relative percentile ranking (1-100) */
    percentileRank: number;
  };
} 