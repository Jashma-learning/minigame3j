// Define base metric type
export interface BaseMetric {
  timestamp: number;
  value: number;
}

// Define game metrics interface
export interface GameMetrics {
  [key: string]: BaseMetric;
}

export interface GameSession {
  gameId: string;
  timestamp: number;
  metrics: GameMetrics;
}

export interface UserGameData {
  [gameId: string]: GameSession[];
}

export interface ScoreHistory {
  timestamp: number;
  score: number;
}

export interface CognitiveDomain {
  currentScore: number;
  history: ScoreHistory[];
}

export interface UserData {
  name: string;
  age: number;
  educationLevel: string;
  previousExperience: string;
  learningStyle: string;
  cognitiveStrengths: string[];
  preferredGameTypes: string[];
  difficultyPreference: string;
  adaptiveSettings: {
    speed: number;
    complexity: number;
    assistance: number;
  };
}

export interface CognitiveProfile {
  userId: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommended_games: string[];
  difficulty_levels: Record<string, string>;
}

export interface GameScore {
  userId: string;
  gameId: string;
  score: number;
  timestamp: number;
  difficulty: string;
}

export interface GameProgress {
  [gameId: string]: {
    level: number;
    completed: boolean;
    score: number;
  };
}

export interface GameData {
  users: { [userId: string]: UserData };
  cognitiveProfiles: { [userId: string]: CognitiveProfile };
  userData: { [key: string]: any };
  gameScores: GameScore[];
  gameProgress: { [userId: string]: GameProgress };
} 