// Base metric types for cognitive assessments
export interface BaseMetric {
  timestamp: number;
  value: number;
}

// Core cognitive metrics interface
export interface CognitiveMetrics {
  memory: MetricValue;
  attention: AttentionMetrics;
  processing: ProcessingMetrics;
  overall: OverallMetrics;
}

// Individual metric categories
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

// Environment and assessment metadata
export interface EnvironmentFactors {
  timeOfDay: number;
  dayOfWeek: number;
  completionTime: number;
}

export interface Assessment {
  timestamp: number;
  metrics: CognitiveMetrics;
  sessionId: string;
  environmentFactors: EnvironmentFactors;
}

// Helper function to create a new metric
export const createMetric = (value: number): BaseMetric => ({
  timestamp: Date.now(),
  value
});

// Type guard functions
export const isMetricValue = (metrics: unknown): metrics is MetricValue => {
  const m = metrics as MetricValue;
  return typeof m?.accuracy === 'number' && 
         typeof m?.reactionTime === 'number' && 
         typeof m?.span === 'number' && 
         typeof m?.errorRate === 'number';
};

export const isAttentionMetrics = (metrics: unknown): metrics is AttentionMetrics => {
  const m = metrics as AttentionMetrics;
  return typeof m?.focusScore === 'number' && 
         typeof m?.consistency === 'number' && 
         typeof m?.deliberationTime === 'number';
};

export const isProcessingMetrics = (metrics: unknown): metrics is ProcessingMetrics => {
  const m = metrics as ProcessingMetrics;
  return typeof m?.cognitiveLoad === 'number' && 
         typeof m?.processingSpeed === 'number' && 
         typeof m?.efficiency === 'number';
};

export const isOverallMetrics = (metrics: unknown): metrics is OverallMetrics => {
  const m = metrics as OverallMetrics;
  return typeof m?.performanceScore === 'number' && 
         typeof m?.confidenceLevel === 'number' && 
         typeof m?.percentileRank === 'number';
};

export const isCognitiveMetrics = (metrics: unknown): metrics is CognitiveMetrics => {
  if (typeof metrics !== 'object' || metrics === null) return false;
  
  const m = metrics as CognitiveMetrics;
  return isMetricValue(m.memory) &&
         isAttentionMetrics(m.attention) &&
         isProcessingMetrics(m.processing) &&
         isOverallMetrics(m.overall);
};

// Memory-specific metrics
export interface MemoryRecallMetrics extends CognitiveMetrics {
  memory: MetricValue & {
    explorationTime: number;
    recallTime: number;
    distractionScore: number;
    patternRecognition: number;
    spatialMemory: number;
    workingMemory: number;
  };
}

// Game-specific metrics union type
export type GameSpecificMetrics = MemoryRecallMetrics; 