export type GamePhase = 'start' | 'exploration' | 'distraction' | 'recall' | 'result';

export interface GameObject {
  id: string;
  type: string;
  position: [number, number];
}

export interface ObjectPlacement {
  objectId: string;
  originalPosition: [number, number];
  placedPosition: [number, number];
  timeTaken: number;
  isCorrect: boolean;
}

export interface GameProgress {
  level: number;
  xp: number;
  badges: string[];
  unlockedMaps: number;
}

export interface GameMetrics {
  explorationTime: number;
  recallTime: number;
  accuracy: number;
  distractionScore: number;
  objectPlacements: ObjectPlacement[];
  hesitationTime: number;
}

export interface CognitiveIndices {
  smi: number;   // Spatial Memory Index
  psi: number;   // Processing Speed Index
  asi: number;   // Attention Span Index
  dri: number;   // Distraction Resistance Index
  seqi: number;  // Sequential Memory Index
  ocps: number;  // Overall Cognitive Performance Score
}

export interface LevelParameters {
  gridSize: number;
  objectCount: number;
  memorizationTime: number;
  distractionComplexity: number;
}