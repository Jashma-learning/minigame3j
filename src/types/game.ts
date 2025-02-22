export type GamePhase = 'start' | 'exploration' | 'distraction' | 'recall' | 'result';

export interface GameObject {
  id: string;
  position: [number, number];
  rotation?: [number, number];
  geometry: 'crystal' | 'key' | 'dragon' | 'potion' | 'compass';
  color: string;
  glow?: boolean;
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
  objectPlacements: Array<{
    objectId: string;
    originalPosition: [number, number];
    placedPosition: [number, number];
    timeTaken: number;
    isCorrect: boolean;
  }>;
  hesitationTime: number;  // Time taken before first move
}