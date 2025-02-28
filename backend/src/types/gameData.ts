import { GameMetrics } from '../../../src/types/metrics';

export interface GameSession {
  gameId: string;
  timestamp: number;
  metrics: GameMetrics;
}

export interface UserGameData {
  [gameId: string]: GameSession[];
}

export interface GameData {
  users: {
    [userId: string]: UserGameData;
  };
} 