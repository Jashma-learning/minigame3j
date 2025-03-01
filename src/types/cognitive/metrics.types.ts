// Base metric type for all cognitive measurements
export interface BaseMetric {
  timestamp: number;
  value: number;
}

// Generic game metrics interface
export interface GameMetrics {
  // Core cognitive metrics
  accuracy: number;
  responseTime: number;
  completionTime: number;
  errorRate: number;
  
  // Learning metrics
  learningRate: number;
  adaptationSpeed: number;
  
  // Performance metrics
  performanceScore: number;
  difficultyLevel: number;
}

// Helper function to create a new metric
export const createMetric = (value: number): BaseMetric => ({
  timestamp: Date.now(),
  value
});

// Memory-specific metrics
export interface MemoryRecallMetrics extends GameMetrics {
  accuracy: number;
  explorationTime: number;
  recallTime: number;
  distractionScore: number;
  patternRecognition: number;
  spatialMemory: number;
  workingMemory: number;
}

// Game-specific metrics union type
export type GameSpecificMetrics = MemoryRecallMetrics; 