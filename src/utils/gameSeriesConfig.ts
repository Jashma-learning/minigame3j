export interface GameConfig {
  id: string;
  name: string;
  path: string;
  description: string;
  estimatedDuration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const gameSeriesConfig: GameConfig[] = [
  {
    id: 'memory-match',
    name: 'Memory Match',
    path: '/games?game=memory-match',
    description: 'Test your memory by matching pairs of cards',
    estimatedDuration: '5-7 min',
    difficulty: 'Easy'
  },
  {
    id: 'memory-recall',
    name: 'Memory Recall',
    path: '/games?game=memory-recall',
    description: 'Remember and recreate object positions',
    estimatedDuration: '8-10 min',
    difficulty: 'Medium'
  },
  {
    id: 'go-no-go',
    name: 'Go/No-Go',
    path: '/games?game=go-no-go',
    description: 'Test your response inhibition',
    estimatedDuration: '5-7 min',
    difficulty: 'Easy'
  },
  {
    id: 'stroop-challenge',
    name: 'Stroop Challenge',
    path: '/games?game=stroop-challenge',
    description: 'Color-word interference challenge',
    estimatedDuration: '6-8 min',
    difficulty: 'Medium'
  },
  {
    id: 'pattern-puzzle',
    name: 'Pattern Puzzle',
    path: '/games?game=pattern-puzzle',
    description: 'Complete visual patterns',
    estimatedDuration: '7-9 min',
    difficulty: 'Medium'
  },
  {
    id: 'spatial-navigator',
    name: 'Spatial Navigator',
    path: '/games?game=spatial-navigator',
    description: '3D object manipulation challenge',
    estimatedDuration: '8-10 min',
    difficulty: 'Hard'
  },
  {
    id: 'maze-2d',
    name: 'Maze 2D',
    path: '/games?game=maze-2d',
    description: 'Navigate through 2D mazes',
    estimatedDuration: '5-7 min',
    difficulty: 'Easy'
  },
  {
    id: 'tower-planning',
    name: 'Tower Planning',
    path: '/games?game=tower-planning',
    description: 'Strategic tower building challenge',
    estimatedDuration: '7-9 min',
    difficulty: 'Medium'
  },
  {
    id: 'story-builder',
    name: 'Story Builder',
    path: '/games?game=story-builder',
    description: 'Create stories and develop language skills',
    estimatedDuration: '8-10 min',
    difficulty: 'Medium'
  }
];

export const getNextGame = (currentGameId: string): GameConfig | null => {
  const currentIndex = gameSeriesConfig.findIndex(game => game.id === currentGameId);
  return currentIndex < gameSeriesConfig.length - 1 
    ? gameSeriesConfig[currentIndex + 1] 
    : null;
};

export const isLastGame = (currentGameId: string): boolean => {
  const currentIndex = gameSeriesConfig.findIndex(game => game.id === currentGameId);
  return currentIndex === gameSeriesConfig.length - 1;
}; 