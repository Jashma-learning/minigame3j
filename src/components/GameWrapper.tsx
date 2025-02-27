'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

type GameType = 'memory-recall' | 'maze-2d' | 'maze-3d' | 'pattern-puzzle' | 'tower-planning' | 'memory-match' | 'stroop-challenge';

interface GameProgress {
  memoryRecallCompleted: boolean;
  maze2dCompleted: boolean;
  maze3dCompleted: boolean;
  patternPuzzleCompleted: boolean;
  towerPlanningCompleted: boolean;
  memoryMatchCompleted: boolean;
  stroopChallengeCompleted: boolean;
  memoryRecallScore: number;
  maze2dScore: number;
  maze3dScore: number;
  patternPuzzleScore: number;
  towerPlanningScore: number;
  memoryMatchScore: number;
  stroopChallengeScore: number;
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

function DevTools({ currentGame, onGameChange, onResetProgress }: DevToolsProps) {
  return (
    <div className="fixed top-4 left-4 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg">
      <select
        value={currentGame}
        onChange={(e) => onGameChange(e.target.value as GameType)}
        className="w-48 p-2 rounded border border-gray-300 mb-2"
      >
        <option value="memory-recall">Memory Recall</option>
        <option value="maze-2d">2D Maze</option>
        <option value="maze-3d">3D Maze</option>
        <option value="pattern-puzzle">Pattern Puzzle</option>
        <option value="tower-planning">Tower Planning</option>
        <option value="memory-match">Memory Match</option>
        <option value="stroop-challenge">Stroop Challenge</option>
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
    memoryRecallScore: 0,
    maze2dScore: 0,
    maze3dScore: 0,
    patternPuzzleScore: 0,
    towerPlanningScore: 0,
    memoryMatchScore: 0,
    stroopChallengeScore: 0
  });

  const handleGameComplete = (game: GameType, score: number) => {
    setGameProgress(prev => ({
      ...prev,
      [`${game}Completed`]: true,
      [`${game}Score`]: score
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
      memoryRecallScore: 0,
      maze2dScore: 0,
      maze3dScore: 0,
      patternPuzzleScore: 0,
      towerPlanningScore: 0,
      memoryMatchScore: 0,
      stroopChallengeScore: 0
    });
    setCurrentGame('memory-recall');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white">
      <DevTools
        currentGame={currentGame}
        onGameChange={handleGameChange}
        onResetProgress={handleResetProgress}
      />

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

      {/* Progress Display */}
      <div className="fixed bottom-4 left-4 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold text-purple-800 mb-2">Game Progress</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${gameProgress.memoryRecallCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Memory Recall {gameProgress.memoryRecallCompleted ? `(${gameProgress.memoryRecallScore})` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${gameProgress.maze2dCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>2D Maze {gameProgress.maze2dCompleted ? `(${gameProgress.maze2dScore})` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${gameProgress.maze3dCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>3D Maze {gameProgress.maze3dCompleted ? `(${gameProgress.maze3dScore})` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${gameProgress.patternPuzzleCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Pattern Puzzle {gameProgress.patternPuzzleCompleted ? `(${gameProgress.patternPuzzleScore})` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${gameProgress.towerPlanningCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Tower Planning {gameProgress.towerPlanningCompleted ? `(${gameProgress.towerPlanningScore})` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${gameProgress.memoryMatchCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Memory Match {gameProgress.memoryMatchCompleted ? `(${gameProgress.memoryMatchScore})` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${gameProgress.stroopChallengeCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Stroop Challenge {gameProgress.stroopChallengeCompleted ? `(${gameProgress.stroopChallengeScore})` : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 