'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGameProgress } from '../../contexts/GameProgressContext';
import { gameSeriesConfig } from '../../utils/gameSeriesConfig';
import MemoryMatchGame from '../../components/games/MemoryMatch/MemoryMatchGame';
import MemoryRecallGame from '../../components/games/MemoryRecall/MemoryRecallGame';
import GoNoGoGame from '../../components/games/GoNoGo/GoNoGoGame';
import StroopChallengeGame from '../../components/games/StroopChallenge/StroopChallengeGame';
import PatternPuzzleGame from '../../components/games/PatternPuzzle/PatternPuzzleGame';
import SpatialNavigatorGame from '../../components/games/SpatialNavigator/SpatialNavigatorGame';
import Maze2DGame from '../../components/games/Maze2D/Maze2DGame';
import TowerPlanningGame from '../../components/games/TowerPlanning/TowerPlanningGame';
import StoryBuilderGame from '../../components/games/StoryBuilder/StoryBuilderGame';

export default function GamesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { completeGame } = useGameProgress();
  const gameId = searchParams.get('game') || gameSeriesConfig[0].id;
  const currentGame = gameSeriesConfig.find(g => g.id === gameId);

  const handleGameComplete = (metrics: any) => {
    completeGame(gameId, metrics);
    const currentIndex = gameSeriesConfig.findIndex(g => g.id === gameId);
    const nextGame = gameSeriesConfig[currentIndex + 1];
    
    if (nextGame) {
      router.push(`/games?game=${nextGame.id}`);
    } else {
      router.push('/progress');
    }
  };

  const renderGame = () => {
    switch (gameId) {
      case 'memory-match':
        return <MemoryMatchGame onComplete={handleGameComplete} />;
      case 'memory-recall':
        return <MemoryRecallGame onComplete={handleGameComplete} />;
      case 'go-no-go':
        return <GoNoGoGame onComplete={handleGameComplete} />;
      case 'stroop-challenge':
        return <StroopChallengeGame onComplete={handleGameComplete} />;
      case 'pattern-puzzle':
        return <PatternPuzzleGame onComplete={handleGameComplete} />;
      case 'spatial-navigator':
        return <SpatialNavigatorGame onComplete={handleGameComplete} />;
      case 'maze-2d':
        return <Maze2DGame onComplete={handleGameComplete} />;
      case 'tower-planning':
        return <TowerPlanningGame onComplete={handleGameComplete} />;
      case 'story-builder':
        return <StoryBuilderGame onComplete={handleGameComplete} />;
      default:
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
            <p>The requested game is not available.</p>
          </div>
        );
    }
  };

  if (!currentGame) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Invalid Game</h2>
        <p>The requested game does not exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-white">{currentGame.name}</h1>
          <p className="text-center text-indigo-200 mt-2">{currentGame.description}</p>
          <div className="flex justify-center gap-4 mt-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Duration: {currentGame.estimatedDuration}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Difficulty: {currentGame.difficulty}
            </span>
          </div>
        </div>
        {renderGame()}
      </div>
    </div>
  );
} 