'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { GameSpecificMetrics } from '../types/cognitiveMetrics';
import { gameSeriesConfig } from '../utils/gameSeriesConfig';

interface GameProgress {
  completed: boolean;
  lastPlayed: number | null;
  metrics: Record<string, any>[];
  bestScore?: number;
}

interface UserProgress {
  [gameId: string]: GameProgress;
}

interface ProgressContextType {
  progress: UserProgress;
  addGameResult: (gameId: string, metrics: Record<string, any>) => void;
  getGameProgress: (gameId: string) => GameProgress | null;
  getOverallProgress: () => number;
  getSkillProgress: (skillType: string) => number;
  getCognitiveProfile: () => Record<string, number>;
}

const defaultProgress: UserProgress = gameSeriesConfig.reduce((acc, game) => ({
  ...acc,
  [game.id]: {
    completed: false,
    lastPlayed: null,
    metrics: []
  }
}), {});

const ProgressContext = createContext<ProgressContextType | null>(null);

// Mapping of metrics to cognitive skills
const COGNITIVE_SKILLS_MAPPING = {
  memory: [
    'Memory_Recall_Accuracy',
    'Short_Term_Memory_Retention',
    'Working_Memory_Span',
    'Verbal_Working_Memory_Score'
  ],
  attention: [
    'Selective_Attention_Score',
    'Sustained_Attention_Duration',
    'Attention_Shift_Accuracy',
    'Distractibility_Index'
  ],
  processing: [
    'Information_Processing_Speed',
    'Reaction_Time',
    'Mental_Rotation_Speed',
    'Decision_Time'
  ],
  executive: [
    'Planning_Efficiency',
    'Cognitive_Flexibility_Score',
    'Task_Switching_Efficiency',
    'Impulse_Control_Score'
  ],
  spatial: [
    'Spatial_Rotation_Accuracy',
    'Navigation_Error_Rate',
    'Spatial_Problem_Solving',
    'Pathfinding_Efficiency'
  ]
};

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  const addGameResult = useCallback((gameId: string, metrics: Record<string, any>) => {
    setProgress(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        completed: true,
        lastPlayed: Date.now(),
        metrics: [...(prev[gameId]?.metrics || []), metrics]
      }
    }));
  }, []);

  const getGameProgress = useCallback((gameId: string): GameProgress | null => {
    return progress[gameId] || null;
  }, [progress]);

  const getOverallProgress = useCallback((): number => {
    const completedGames = Object.values(progress).filter(game => game.completed).length;
    return (completedGames / gameSeriesConfig.length) * 100;
  }, [progress]);

  const getSkillProgress = useCallback((skillType: string): number => {
    const relevantMetrics = COGNITIVE_SKILLS_MAPPING[skillType as keyof typeof COGNITIVE_SKILLS_MAPPING] || [];
    let totalScore = 0;
    let count = 0;

    Object.values(progress).forEach(game => {
      if (game.metrics.length > 0) {
        const latestMetrics = game.metrics[game.metrics.length - 1];
        relevantMetrics.forEach(metric => {
          if (latestMetrics[metric]) {
            totalScore += latestMetrics[metric].value;
            count++;
          }
        });
      }
    });

    return count > 0 ? (totalScore / count) : 0;
  }, [progress]);

  const getCognitiveProfile = useCallback((): Record<string, number> => {
    return Object.keys(COGNITIVE_SKILLS_MAPPING).reduce((profile, skill) => ({
      ...profile,
      [skill]: getSkillProgress(skill)
    }), {});
  }, [getSkillProgress]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        addGameResult,
        getGameProgress,
        getOverallProgress,
        getSkillProgress,
        getCognitiveProfile
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}; 