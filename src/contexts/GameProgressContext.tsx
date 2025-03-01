'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { gameSeriesConfig, GameConfig } from '../utils/gameSeriesConfig';

interface GameProgress {
  completed: string[];
  currentGame: string;
  metrics: Record<string, any>;
}

interface GameProgressContextType {
  progress: GameProgress;
  completeGame: (gameId: string, metrics: any) => void;
  getCurrentGame: () => GameConfig | null;
  getGameProgress: (gameId: string) => number;
  getAllMetrics: () => Record<string, any>;
}

const defaultProgress: GameProgress = {
  completed: [],
  currentGame: gameSeriesConfig[0].id,
  metrics: {}
};

const GameProgressContext = createContext<GameProgressContextType | null>(null);

export const GameProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<GameProgress>(defaultProgress);

  const completeGame = useCallback((gameId: string, metrics: any) => {
    setProgress(prev => {
      const completed = [...prev.completed];
      if (!completed.includes(gameId)) {
        completed.push(gameId);
      }

      const currentIndex = gameSeriesConfig.findIndex(game => game.id === gameId);
      const nextGame = currentIndex < gameSeriesConfig.length - 1 
        ? gameSeriesConfig[currentIndex + 1].id 
        : gameId;

      return {
        ...prev,
        completed,
        currentGame: nextGame,
        metrics: {
          ...prev.metrics,
          [gameId]: metrics
        }
      };
    });
  }, []);

  const getCurrentGame = useCallback(() => {
    return gameSeriesConfig.find(game => game.id === progress.currentGame) || null;
  }, [progress.currentGame]);

  const getGameProgress = useCallback((gameId: string) => {
    const index = gameSeriesConfig.findIndex(game => game.id === gameId);
    const completedCount = progress.completed.length;
    return (index + 1) / gameSeriesConfig.length * 100;
  }, [progress.completed]);

  const getAllMetrics = useCallback(() => {
    return progress.metrics;
  }, [progress.metrics]);

  return (
    <GameProgressContext.Provider 
      value={{
        progress,
        completeGame,
        getCurrentGame,
        getGameProgress,
        getAllMetrics
      }}
    >
      {children}
    </GameProgressContext.Provider>
  );
};

export const useGameProgress = () => {
  const context = useContext(GameProgressContext);
  if (!context) {
    throw new Error('useGameProgress must be used within a GameProgressProvider');
  }
  return context;
}; 