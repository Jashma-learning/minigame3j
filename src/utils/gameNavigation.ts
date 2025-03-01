import { gameSeriesConfig } from './gameSeriesConfig';

export interface GameNavigationInfo {
  currentGame: typeof gameSeriesConfig[0];
  nextGame: typeof gameSeriesConfig[0] | null;
  isLastGame: boolean;
  currentIndex: number;
  totalGames: number;
}

export function getGameNavigationInfo(currentGameId: string): GameNavigationInfo {
  const currentIndex = gameSeriesConfig.findIndex(game => game.id === currentGameId);
  const currentGame = gameSeriesConfig[currentIndex];
  const nextGame = currentIndex < gameSeriesConfig.length - 1 ? gameSeriesConfig[currentIndex + 1] : null;
  const isLastGame = currentIndex === gameSeriesConfig.length - 1;

  return {
    currentGame,
    nextGame,
    isLastGame,
    currentIndex,
    totalGames: gameSeriesConfig.length
  };
}

export function getGamePath(gameId: string): string {
  const game = gameSeriesConfig.find(g => g.id === gameId);
  if (!game) throw new Error(`Game ${gameId} not found in series config`);
  return `/games/${game.path}`;
}

export function getFirstGamePath(): string {
  return getGamePath(gameSeriesConfig[0].id);
} 