import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tower from './components/Tower';
import GameControls from './components/GameControls';
import GameSubmission from '../../GameSubmission';
import { getGameNavigationInfo } from '../../../utils/gameNavigation';
import { generateLevel, calculateOptimalMoves, getNextOptimalMove } from './utils/gameUtils';

interface TowerPlanningGameProps {
  onComplete?: (metrics: any) => void;
}

type GamePhase = 'start' | 'playing' | 'complete';

interface GameState {
  phase: GamePhase;
  level: number;
  score: number;
  moves: number;
  minMoves: number;
  disks: number[];
  towers: number[][];
  selectedTower: number | null;
  hints: number;
  timeElapsed: number;
}

export default function TowerPlanningGame({ onComplete }: TowerPlanningGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'playing',
    level: 1,
    score: 0,
    moves: 0,
    minMoves: 7,
    disks: [3, 2, 1],
    towers: [[3, 2, 1], [], []],
    selectedTower: null,
    hints: 3,
    timeElapsed: 0,
  });

  const [metrics, setMetrics] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { nextGame, isLastGame } = getGameNavigationInfo('tower-planning');

  // Timer effect
  useEffect(() => {
    if (gameState.phase === 'playing') {
      const timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
        }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.phase]);

  const handleTowerClick = useCallback((towerIndex: number) => {
    setGameState(prev => {
      // If no tower is selected, select this tower if it has disks
      if (prev.selectedTower === null) {
        if (prev.towers[towerIndex].length > 0) {
          return { ...prev, selectedTower: towerIndex };
        }
        return prev;
      }

      // If clicking the same tower, deselect it
      if (prev.selectedTower === towerIndex) {
        return { ...prev, selectedTower: null };
      }

      // Try to move disk from selected tower to clicked tower
      const fromTower = prev.towers[prev.selectedTower];
      const toTower = prev.towers[towerIndex];

      // Check if move is valid
      const diskToMove = fromTower[fromTower.length - 1];
      const topDiskAtDestination = toTower[toTower.length - 1];
      
      if (!topDiskAtDestination || diskToMove < topDiskAtDestination) {
        // Valid move - create new towers array
        const newTowers = prev.towers.map((t, i) => {
          if (i === prev.selectedTower) return t.slice(0, -1);
          if (i === towerIndex) return [...t, diskToMove];
          return t;
        });

        // Check if game is complete
        const isComplete = newTowers[2].length === prev.disks.length;
        const newMoves = prev.moves + 1;
        const moveScore = Math.max(0, 100 - (newMoves - prev.minMoves) * 10);
        const timeScore = Math.max(0, 100 - Math.floor(prev.timeElapsed / 5));
        const levelScore = moveScore + timeScore;

        if (isComplete) {
          const finalMetrics = {
            Planning_Efficiency: {
              value: moveScore,
              timestamp: Date.now()
            },
            Task_Sustainability_Score: {
              value: timeScore,
              timestamp: Date.now()
            },
            Cognitive_Flexibility_Score: {
              value: Math.min(100, (prev.hints / 3) * 100),
              timestamp: Date.now()
            },
            Error_Correction_Speed: {
              value: Math.max(0, 100 - (newMoves - prev.minMoves) * 20),
              timestamp: Date.now()
            },
            Cognitive_Load_Handling_Score: {
              value: levelScore,
              timestamp: Date.now()
            }
          };
          
          setMetrics(finalMetrics);
          
          return {
            ...prev,
            towers: newTowers,
            selectedTower: null,
            moves: newMoves,
            score: prev.score + levelScore,
            phase: 'complete' as const
          };
        }

        return {
          ...prev,
          towers: newTowers,
          selectedTower: null,
          moves: newMoves,
        };
      }

      // Invalid move - just deselect
      return { ...prev, selectedTower: null };
    });
  }, []);

  const handleHint = useCallback(() => {
    if (gameState.hints <= 0) return;

    setGameState(prev => {
      const nextMove = getNextOptimalMove(prev.towers, [[], [], prev.disks]);
      if (!nextMove) return prev;

      return {
        ...prev,
        hints: prev.hints - 1,
        selectedTower: nextMove.from
      };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (onComplete && metrics) {
      onComplete(metrics);
    }
  }, [onComplete, metrics]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 to-orange-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Tower of Planning</h1>
          <GameControls
            level={gameState.level}
            score={gameState.score}
            moves={gameState.moves}
            minMoves={gameState.minMoves}
            hints={gameState.hints}
            onHint={handleHint}
            timeElapsed={gameState.timeElapsed}
          />
        </div>

        {/* Game Area */}
        <div className="flex flex-col items-center gap-8">
          {gameState.phase === 'playing' && (
            <div className="w-full">
              <Tower
                towers={gameState.towers}
                selectedTower={gameState.selectedTower}
                onTowerClick={handleTowerClick}
              />
            </div>
          )}

          {/* Game Submission */}
          {metrics && (
            <GameSubmission
              isComplete={gameState.phase === 'complete'}
              onSubmit={handleSubmit}
              gameMetrics={metrics}
              nextGame={nextGame?.id}
              isLastGame={isLastGame}
              currentGameId="tower-planning"
            />
          )}
        </div>
      </div>
    </div>
  );
} 