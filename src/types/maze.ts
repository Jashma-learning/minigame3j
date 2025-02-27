export type MazePhase = 'tutorial' | 'exploration' | 'puzzle' | 'decision' | 'result';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export type CellType = 'wall' | 'path' | 'collectible' | 'start' | 'end';
export type PuzzleType = 'pattern' | 'sequence' | 'logic' | 'timing';
export type CollectibleType = 'key' | 'artifact' | 'powerup';

export interface MazeCell {
  type: CellType;
  position: Position3D;
}

export interface PuzzleSolution {
  pattern?: number[];
  sequence?: number[];
  logic?: {
    inputs: boolean[];
    output: boolean;
  };
  timing?: {
    duration: number;
    tolerance: number;
  };
}

export interface PuzzleState {
  id: string;
  type: PuzzleType;
  isCompleted: boolean;
  attempts: number;
  timeSpent: number;
  solution: PuzzleSolution;
  playerInput: any;
  position: Position3D;
}

export interface PlayerState {
  position: Position3D;
  rotation: number;
  velocity: Position3D;
  inventory: string[];
  health: number;
  stamina: number;
  activeEffects: string[];
}

export interface ObjectPlacement {
  timeTaken: number;
  isCorrect: boolean;
}

export interface GameMetrics {
  objectPlacements: ObjectPlacement[];
  timeSpent: number;
  score: number;
  completionPercentage: number;
  accuracy: number;
}

export interface CollectibleItem extends MazeCell {
  type: 'collectible';
  value: number;
}

export interface MazeLevel {
  cells: MazeCell[];
  collectibles: MazeCell[];
  size: {
    width: number;
    height: number;
    depth: number;
  };
  startPosition: Position3D;
  endPosition: Position3D;
  minimumRequiredItems: string[];
  difficulty: number;
}

export interface GameState {
  currentLevel: number;
  player: PlayerState;
  score: number;
  timeElapsed: number;
  isPaused: boolean;
  isGameOver: boolean;
  completedLevels: string[];
  unlockedAchievements: string[];
}

export interface GameAction {
  type: 'MOVE' | 'INTERACT' | 'SOLVE_PUZZLE' | 'COLLECT_ITEM' | 'USE_ITEM' | 'CHECKPOINT';
  payload: any;
}

export interface Wall {
  position: Position3D;
  scale: [number, number, number];
} 