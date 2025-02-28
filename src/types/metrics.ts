export interface BaseGameMetrics {
  [key: string]: number;
}

export interface Maze2DMetrics extends BaseGameMetrics {
  totalTime: number;
  pathLength: number;
  wrongTurns: number;
  backtracks: number;
  idleTime: number;
  collisions: number;
  correctTurns: number;
  collectiblesGathered: number;
  totalCollectibles: number;
  completionTime: number;
  accuracy: number;
}

export interface MemoryMatchMetrics extends BaseGameMetrics {
  score: number;
  timeElapsed: number;
  matchAccuracy: number;
  totalMoves: number;
}

export interface MemoryRecallMetrics extends BaseGameMetrics {
  accuracy: number;
  explorationTime: number;
  recallTime: number;
  distractionScore: number;
  hesitationTime: number;
  totalObjects: number;
  correctPlacements: number;
}

export type GameMetrics = Maze2DMetrics | MemoryMatchMetrics | MemoryRecallMetrics; 