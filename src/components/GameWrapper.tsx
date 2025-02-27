'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

type GameType = 'memory-recall' | 'maze-2d' | 'maze-3d' | 'pattern-puzzle' | 'tower-planning' | 'memory-match' | 'stroop-challenge' | 'spatial-navigator' | 'find-the-odd' | 'go-no-go' | 'story-builder';

interface GameProgress {
  memoryRecallCompleted: boolean;
  maze2dCompleted: boolean;
  maze3dCompleted: boolean;
  patternPuzzleCompleted: boolean;
  towerPlanningCompleted: boolean;
  memoryMatchCompleted: boolean;
  stroopChallengeCompleted: boolean;
  spatialNavigatorCompleted: boolean;
  findTheOddCompleted: boolean;
  goNoGoCompleted: boolean;
  storyBuilderCompleted: boolean;
  memoryRecallScore: number;
  maze2dScore: number;
  maze3dScore: number;
  patternPuzzleScore: number;
  towerPlanningScore: number;
  memoryMatchScore: number;
  stroopChallengeScore: number;
  spatialNavigatorScore: number;
  findTheOddScore: number;
  goNoGoScore: number;
  storyBuilderScore: number;
}

interface DevToolsProps {
  currentGame: GameType;
  onGameChange: (game: GameType) => void;
  onResetProgress: () => void;
}

const MemoryRecallGame = dynamic(
  () => import('./games/MemoryRecall/MemoryRecallGame'),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

const Maze2DGame = dynamic(
  () => import('./games/Maze2D/Maze2DGame'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

const Maze3DGame = dynamic(
  () => import('./games/Maze3D/Maze3DGame'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

const PatternPuzzleGame = dynamic(
  () => import('./games/PatternPuzzle/PatternPuzzleGame'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

const TowerPlanningGame = dynamic(
  () => import('./games/TowerPlanning/TowerPlanningGame'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

const MemoryMatchGame = dynamic(
  () => import('./games/MemoryMatch/MemoryMatchGame'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

const StroopChallengeGame = dynamic(
  () => import('./games/StroopChallenge/StroopChallengeGame'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

const SpatialNavigatorGame = dynamic(
  () => import('./games/SpatialNavigator/SpatialNavigatorGame'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

const FindTheOddGame = dynamic(
  () => import('./games/FindTheOdd/FindTheOddGame'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

const GoNoGoGame = dynamic(() => import('./games/GoNoGo/GoNoGoGame'), {
  loading: () => <div className="text-center">Loading Go/No-Go Challenge...</div>,
  ssr: false,
});

const StoryBuilderGame = dynamic(
  () => import('./games/StoryBuilder/StoryBuilderGame'),
  {
    ssr: false,
    loading: () => <div className="text-center">Loading Story Builder...</div>
  }
);

function DevTools({ currentGame, onGameChange, onResetProgress }: DevToolsProps) {
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-gray-800 rounded-lg shadow-lg z-50">
      <select
        value={currentGame}
        onChange={(e) => onGameChange(e.target.value as GameType)}
        className="w-48 p-2 bg-gray-700 text-white rounded mb-2"
      >
        <option value="memory-recall">Memory Recall</option>
        <option value="maze-2d">2D Maze</option>
        <option value="maze-3d">3D Maze</option>
        <option value="pattern-puzzle">Pattern Puzzle</option>
        <option value="tower-planning">Tower Planning</option>
        <option value="memory-match">Memory Match</option>
        <option value="stroop-challenge">Stroop Challenge</option>
        <option value="spatial-navigator">Spatial Navigator</option>
        <option value="find-the-odd">Find the Odd</option>
        <option value="go-no-go">Go/No-Go</option>
        <option value="story-builder">Story Builder</option>
      </select>
      <button
        onClick={onResetProgress}
        className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Reset Progress
      </button>
    </div>
  );
}

export default function GameWrapper() {
  const [currentGame, setCurrentGame] = useState<GameType>('memory-recall');
  const [gameProgress, setGameProgress] = useState<GameProgress>({
    memoryRecallCompleted: false,
    maze2dCompleted: false,
    maze3dCompleted: false,
    patternPuzzleCompleted: false,
    towerPlanningCompleted: false,
    memoryMatchCompleted: false,
    stroopChallengeCompleted: false,
    spatialNavigatorCompleted: false,
    findTheOddCompleted: false,
    goNoGoCompleted: false,
    storyBuilderCompleted: false,
    memoryRecallScore: 0,
    maze2dScore: 0,
    maze3dScore: 0,
    patternPuzzleScore: 0,
    towerPlanningScore: 0,
    memoryMatchScore: 0,
    stroopChallengeScore: 0,
    spatialNavigatorScore: 0,
    findTheOddScore: 0,
    goNoGoScore: 0,
    storyBuilderScore: 0,
  });

  const handleGameComplete = (game: GameType, score: number) => {
    setGameProgress(prev => ({
      ...prev,
      [`${game}Completed`]: true,
      [`${game}Score`]: score,
    }));
  };

  const handleGameChange = (game: GameType) => {
    setCurrentGame(game);
  };

  const handleResetProgress = () => {
    setGameProgress({
      memoryRecallCompleted: false,
      maze2dCompleted: false,
      maze3dCompleted: false,
      patternPuzzleCompleted: false,
      towerPlanningCompleted: false,
      memoryMatchCompleted: false,
      stroopChallengeCompleted: false,
      spatialNavigatorCompleted: false,
      findTheOddCompleted: false,
      goNoGoCompleted: false,
      storyBuilderCompleted: false,
      memoryRecallScore: 0,
      maze2dScore: 0,
      maze3dScore: 0,
      patternPuzzleScore: 0,
      towerPlanningScore: 0,
      memoryMatchScore: 0,
      stroopChallengeScore: 0,
      spatialNavigatorScore: 0,
      findTheOddScore: 0,
      goNoGoScore: 0,
      storyBuilderScore: 0,
    });
    setCurrentGame('memory-recall');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Cognitive Training Games</h1>
        
        {/* Game Components */}
        {currentGame === 'go-no-go' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Go/No-Go Challenge</h2>
            <GoNoGoGame onComplete={(score) => handleGameComplete('go-no-go', score)} />
          </div>
        )}
        {currentGame === 'memory-recall' && (
          <div className="relative">
            <MemoryRecallGame 
              onComplete={(score: number) => handleGameComplete('memory-recall', score)} 
            />
            {!gameProgress.memoryRecallCompleted && (
              <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg">
                Memory Challenge
              </div>
            )}
          </div>
        )}

        {currentGame === 'maze-2d' && (
          <div className="relative">
            <Maze2DGame 
              cellSize={40}
              onComplete={(score: number) => handleGameComplete('maze-2d', score)}
            />
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg">
              2D Maze Challenge
            </div>
          </div>
        )}

        {currentGame === 'maze-3d' && (
          <div className="relative">
            <Maze3DGame 
              width={15}
              height={15}
              debug={false}
              onComplete={(score: number) => handleGameComplete('maze-3d', score)}
            />
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg">
              3D Maze Challenge
            </div>
          </div>
        )}

        {currentGame === 'pattern-puzzle' && (
          <div className="relative">
            <PatternPuzzleGame 
              onComplete={(score: number) => handleGameComplete('pattern-puzzle', score)}
            />
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg">
              Pattern Puzzler
            </div>
          </div>
        )}

        {currentGame === 'tower-planning' && (
          <div className="relative">
            <TowerPlanningGame 
              onComplete={(score: number) => handleGameComplete('tower-planning', score)}
            />
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg">
              Tower Planning
            </div>
          </div>
        )}

        {currentGame === 'memory-match' && (
          <div className="relative">
            <MemoryMatchGame 
              onComplete={(score: number) => handleGameComplete('memory-match', score)}
            />
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg">
              Memory Match Challenge
            </div>
          </div>
        )}

        {currentGame === 'stroop-challenge' && (
          <div className="relative">
            <StroopChallengeGame 
              onComplete={(score: number) => handleGameComplete('stroop-challenge', score)}
            />
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg">
              Stroop Challenge
            </div>
          </div>
        )}

        {currentGame === 'spatial-navigator' && (
          <div className="relative">
            <SpatialNavigatorGame 
              onComplete={(score: number) => handleGameComplete('spatial-navigator', score)}
            />
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg">
              Spatial Navigator Challenge
            </div>
          </div>
        )}

        {currentGame === 'find-the-odd' && (
          <div className="relative">
            <FindTheOddGame 
              onComplete={(score: number) => handleGameComplete('find-the-odd', score)}
            />
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg">
              Find the Odd One Challenge
            </div>
          </div>
        )}

        {currentGame === 'story-builder' && (
          <div className="relative">
            <StoryBuilderGame 
              onComplete={(score: number) => handleGameComplete('story-builder', score)}
            />
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg">
              Story Builder Challenge
            </div>
          </div>
        )}

        {/* Progress Display */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${gameProgress.memoryRecallCompleted ? 'bg-green-600' : 'bg-gray-800'}`}>
            <div className="font-bold">Memory Recall</div>
            <div>Score: {gameProgress.memoryRecallScore}</div>
          </div>
          <div className={`p-4 rounded-lg ${gameProgress.maze2dCompleted ? 'bg-green-600' : 'bg-gray-800'}`}>
            <div className="font-bold">2D Maze</div>
            <div>Score: {gameProgress.maze2dScore}</div>
          </div>
          <div className={`p-4 rounded-lg ${gameProgress.maze3dCompleted ? 'bg-green-600' : 'bg-gray-800'}`}>
            <div className="font-bold">3D Maze</div>
            <div>Score: {gameProgress.maze3dScore}</div>
          </div>
          <div className={`p-4 rounded-lg ${gameProgress.patternPuzzleCompleted ? 'bg-green-600' : 'bg-gray-800'}`}>
            <div className="font-bold">Pattern Puzzle</div>
            <div>Score: {gameProgress.patternPuzzleScore}</div>
          </div>
          <div className={`p-4 rounded-lg ${gameProgress.towerPlanningCompleted ? 'bg-green-600' : 'bg-gray-800'}`}>
            <div className="font-bold">Tower Planning</div>
            <div>Score: {gameProgress.towerPlanningScore}</div>
          </div>
          <div className={`p-4 rounded-lg ${gameProgress.memoryMatchCompleted ? 'bg-green-600' : 'bg-gray-800'}`}>
            <div className="font-bold">Memory Match</div>
            <div>Score: {gameProgress.memoryMatchScore}</div>
          </div>
          <div className={`p-4 rounded-lg ${gameProgress.stroopChallengeCompleted ? 'bg-green-600' : 'bg-gray-800'}`}>
            <div className="font-bold">Stroop Challenge</div>
            <div>Score: {gameProgress.stroopChallengeScore}</div>
          </div>
          <div className={`p-4 rounded-lg ${gameProgress.spatialNavigatorCompleted ? 'bg-green-600' : 'bg-gray-800'}`}>
            <div className="font-bold">Spatial Navigator</div>
            <div>Score: {gameProgress.spatialNavigatorScore}</div>
          </div>
          <div className={`p-4 rounded-lg ${gameProgress.findTheOddCompleted ? 'bg-green-600' : 'bg-gray-800'}`}>
            <div className="font-bold">Find the Odd One</div>
            <div>Score: {gameProgress.findTheOddScore}</div>
          </div>
          <div className={`p-4 rounded-lg ${gameProgress.goNoGoCompleted ? 'bg-green-600' : 'bg-gray-800'}`}>
            <div className="font-bold">Go/No-Go Challenge</div>
            <div>Score: {gameProgress.goNoGoScore}</div>
          </div>
          <div className={`p-4 rounded-lg ${gameProgress.storyBuilderCompleted ? 'bg-green-600' : 'bg-gray-800'}`}>
            <div className="font-bold">Story Builder</div>
            <div>Score: {gameProgress.storyBuilderScore}</div>
          </div>
        </div>
      </div>

      <DevTools
        currentGame={currentGame}
        onGameChange={handleGameChange}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
} 