import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SpatialNavigatorMetrics } from '../../../types/cognitiveMetrics';
import Scene from './components/Scene';
import Controls from './components/Controls';
import GameSubmission from '../../GameSubmission';
import { getGameNavigationInfo } from '../../../utils/gameNavigation';

interface GameState {
  phase: 'instruction' | 'playing' | 'feedback' | 'complete';
  level: number;
  score: number;
  timeLeft: number;
  targetRotation: [number, number, number];
  currentRotation: [number, number, number];
  attempts: number;
  startTime: number;
  rotationHistory: number[];
}

interface SpatialNavigatorGameProps {
  onComplete?: (metrics: Partial<SpatialNavigatorMetrics>) => void;
}

const INITIAL_TIME = 60; // 60 seconds per level
const MAX_LEVEL = 10;
const ROTATION_THRESHOLD = 0.1; // Acceptable difference in rotation

export default function SpatialNavigatorGame({ onComplete }: SpatialNavigatorGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'instruction',
    level: 1,
    score: 0,
    timeLeft: INITIAL_TIME,
    targetRotation: [0, 0, 0],
    currentRotation: [0, 0, 0],
    attempts: 0,
    startTime: Date.now(),
    rotationHistory: []
  });

  const [metrics, setMetrics] = useState<Partial<SpatialNavigatorMetrics>>({});
  const { nextGame, isLastGame } = getGameNavigationInfo('spatial-navigator');

  useEffect(() => {
    if (gameState.phase === 'playing' && gameState.timeLeft > 0) {
      const timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.phase, gameState.timeLeft]);

  const startGame = useCallback(() => {
    const newTargetRotation: [number, number, number] = [
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    ];

    setGameState(prev => ({
      ...prev,
      phase: 'playing',
      targetRotation: newTargetRotation,
      currentRotation: [0, 0, 0],
      timeLeft: INITIAL_TIME,
      startTime: Date.now(),
      rotationHistory: []
    }));
  }, []);

  const handleRotationChange = useCallback((rotation: [number, number, number]) => {
    setGameState(prev => ({
      ...prev,
      currentRotation: rotation,
      rotationHistory: [...prev.rotationHistory, Math.abs(
        rotation.reduce((sum, val, i) => sum + Math.abs(val - prev.targetRotation[i]), 0)
      )]
    }));
  }, []);

  const calculateMetrics = useCallback(() => {
    const totalTime = Date.now() - gameState.startTime;
    const averageRotationError = gameState.rotationHistory.reduce((sum, val) => sum + val, 0) / 
                                (gameState.rotationHistory.length || 1);
    
    return {
      Spatial_Rotation_Accuracy: {
        value: (gameState.score / (MAX_LEVEL * 1000)) * 100,
        timestamp: Date.now()
      },
      Mental_Rotation_Speed: {
        value: totalTime / gameState.level,
        timestamp: Date.now()
      },
      Navigation_Error_Rate: {
        value: averageRotationError * 100,
        timestamp: Date.now()
      },
      Spatial_Problem_Solving: {
        value: gameState.score,
        timestamp: Date.now()
      },
      Fine_Motor_Skills: {
        value: 100 - (gameState.attempts * 10),
        timestamp: Date.now()
      },
      Cognitive_Working_Capacity: {
        value: (gameState.level / MAX_LEVEL) * 100,
        timestamp: Date.now()
      }
    };
  }, [gameState]);

  const checkRotation = useCallback(() => {
    const isCorrect = gameState.targetRotation.every((target, i) => 
      Math.abs(target - gameState.currentRotation[i]) <= ROTATION_THRESHOLD
    );

    if (isCorrect) {
      const timeBonus = Math.floor(gameState.timeLeft * 10);
      const levelBonus = gameState.level * 100;
      const newScore = gameState.score + 1000 + timeBonus + levelBonus;

      if (gameState.level >= MAX_LEVEL) {
        const finalMetrics = calculateMetrics();
        setMetrics(finalMetrics);
        setGameState(prev => ({
          ...prev,
          phase: 'complete',
          score: newScore
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          phase: 'feedback',
          level: prev.level + 1,
          score: newScore
        }));
      }
    } else {
      setGameState(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        phase: prev.attempts >= 2 ? 'complete' : 'feedback'
      }));
    }
  }, [gameState, calculateMetrics]);

  const handleSubmit = useCallback(() => {
    onComplete?.(metrics);
  }, [metrics, onComplete]);

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 to-indigo-100 py-2 px-4">
      <div className="w-full max-w-xl h-[95%] flex flex-col items-center gap-4">
        {/* Game Header */}
        <div className="w-full text-center mb-2">
          <div className="flex gap-1.5 justify-center">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Level {gameState.level}
            </span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              Score: {gameState.score}
            </span>
            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Time: {gameState.timeLeft}s
            </span>
          </div>
        </div>

        {/* Game Container */}
        <div className="w-full aspect-[4/3] bg-white/80 backdrop-blur-sm rounded-md shadow-md p-2">
          <div className="w-full h-full">
            <Canvas
              camera={{ position: [0, 2, 5], fov: 75 }}
              className="w-full h-full"
            >
              <Scene
                targetRotation={gameState.targetRotation}
                currentRotation={gameState.currentRotation}
                onRotationChange={handleRotationChange}
                isInteractive={gameState.phase === 'playing'}
              />
              <OrbitControls 
                enableZoom={false}
                enablePan={false}
                enabled={gameState.phase === 'playing'}
              />
            </Canvas>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full flex justify-center">
          <Controls
            gameState={gameState}
            onStart={startGame}
            onCheck={checkRotation}
            onNextLevel={startGame}
          />
        </div>
      </div>

      {/* Game Submission */}
      <GameSubmission
        isComplete={gameState.phase === 'complete'}
        onSubmit={handleSubmit}
        gameMetrics={metrics}
        nextGame={nextGame?.path}
        isLastGame={isLastGame}
        currentGameId="spatial-navigator"
      />
    </div>
  );
} 