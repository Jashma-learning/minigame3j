'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateStimulus } from './utils/gameUtils';
import { calculateGoNoGoMetrics } from './GoNoGo.utils';
import { goNoGoService } from '@/services/goNoGoService';
import { GoNoGoGameState, GoNoGoMetrics } from '@/types/cognitive/goNoGo.types';
import GameStimulus from './components/GameStimulus';
import ScoreDisplay from './components/ScoreDisplay';
import { useGameProgress } from '../../../contexts/GameProgressContext';
import { getNextGame } from '../../../utils/gameSeriesConfig';

interface GoNoGoGameProps {
  onComplete?: (metrics: GoNoGoMetrics) => void;
}

interface GameConfig {
  roundsToWin: number;
  initialSpeed: number;
  minSpeed: number;
  goRatio: number;
}

const INITIAL_CONFIG: GameConfig = {
  roundsToWin: 20,
  initialSpeed: 2000, // 2 seconds per stimulus
  minSpeed: 800, // Minimum 0.8 seconds per stimulus
  goRatio: 0.7 // 70% "Go" signals
};

const GoNoGoGame: React.FC<GoNoGoGameProps> = ({ onComplete }) => {
  const [gameConfig, setGameConfig] = useState<GameConfig>(INITIAL_CONFIG);
  const [gameState, setGameState] = useState<GoNoGoGameState>({
    totalRounds: 0,
    responses: [],
    streak: 0,
    currentSpeed: INITIAL_CONFIG.initialSpeed,
    score: 0
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStimulus, setCurrentStimulus] = useState<{
    type: 'go' | 'no-go';
    symbol: string;
    color: string;
  } | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const { completeGame } = useGameProgress();
  const nextGame = getNextGame('go-no-go');

  const timeoutRef = useRef<NodeJS.Timeout>();
  const stimulusTimeoutRef = useRef<NodeJS.Timeout>();
  const stimulusStartTime = useRef<number>(0);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameState({
      totalRounds: 0,
      responses: [],
      streak: 0,
      currentSpeed: INITIAL_CONFIG.initialSpeed,
      score: 0
    });
    setIsWaiting(false);
    startNewRound();
  }, []);

  const startNewRound = useCallback(() => {
    if (gameState.totalRounds >= gameConfig.roundsToWin) {
      endGame();
      return;
    }

    const stimulus = generateStimulus(gameConfig.goRatio);
    setCurrentStimulus(stimulus);
    setShowFeedback(null);
    setIsWaiting(true);
    stimulusStartTime.current = Date.now();

    // Clear previous timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (stimulusTimeoutRef.current) clearTimeout(stimulusTimeoutRef.current);

    // Set timeout for stimulus display
    stimulusTimeoutRef.current = setTimeout(() => {
      if (currentStimulus?.type === 'go') {
        handleResponse(false); // Missed a "Go" signal
      } else {
        handleResponse(true); // Correctly avoided a "No-Go" signal
      }
    }, gameState.currentSpeed);
  }, [gameState.totalRounds, gameState.currentSpeed, gameConfig]);

  const handleResponse = useCallback((responded: boolean) => {
    if (!isWaiting || !currentStimulus) return;
    setIsWaiting(false);

    const responseTime = Date.now() - stimulusStartTime.current;
    const isCorrect = (currentStimulus.type === 'go' && responded) || 
                     (currentStimulus.type === 'no-go' && !responded);

    // Update game state with new response
    setGameState(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const roundScore = isCorrect ? 100 + (prev.streak * 10) : 0;
      const newSpeed = newStreak > 0 && newStreak % 3 === 0 
        ? Math.max(gameConfig.minSpeed, prev.currentSpeed - 100)
        : prev.currentSpeed;

      return {
        ...prev,
        responses: [...prev.responses, {
          timestamp: Date.now(),
          stimulusType: currentStimulus.type,
          responseTime,
          wasCorrect: isCorrect,
          speed: prev.currentSpeed
        }],
        streak: newStreak,
        currentSpeed: newSpeed,
        score: prev.score + roundScore,
        totalRounds: prev.totalRounds + 1
      };
    });

    setShowFeedback(isCorrect ? 'correct' : 'wrong');

    // Clear stimulus timeout
    if (stimulusTimeoutRef.current) {
      clearTimeout(stimulusTimeoutRef.current);
    }

    // Show feedback and proceed to next round
    timeoutRef.current = setTimeout(() => {
      startNewRound();
    }, 1000);
  }, [currentStimulus, isWaiting, gameConfig.minSpeed, startNewRound]);

  const endGame = async () => {
    try {
      setGameStarted(false);
      setIsGameComplete(true);

      // Calculate final metrics
      const metrics = calculateGoNoGoMetrics(gameState);
      
      // Transform metrics to match expected format
      const formattedMetrics = {
        inhibition: {
          accuracy: metrics.inhibition.accuracy,
          noGoAccuracy: metrics.inhibition.noGoAccuracy,
          goAccuracy: metrics.inhibition.goAccuracy,
          falseAlarms: metrics.inhibition.falseAlarms,
          missedGoes: metrics.inhibition.missedGoes
        },
        attention: {
          sustainedAttention: metrics.attention.sustainedAttention,
          vigilanceLevel: metrics.attention.vigilanceLevel,
          attentionalLapses: metrics.attention.attentionalLapses,
          focusQuality: metrics.attention.focusQuality
        },
        processing: {
          averageReactionTime: metrics.processing.averageReactionTime,
          reactionTimeVariability: metrics.processing.reactionTimeVariability,
          processingEfficiency: metrics.processing.processingEfficiency,
          adaptiveControl: metrics.processing.adaptiveControl
        },
        learning: {
          learningRate: metrics.learning.learningRate,
          errorCorrectionSpeed: metrics.learning.errorCorrectionSpeed,
          adaptationQuality: metrics.learning.adaptationQuality,
          performanceStability: metrics.learning.performanceStability
        },
        overall: {
          performanceScore: metrics.overall.performanceScore,
          cognitiveFatigue: metrics.overall.cognitiveFatigue,
          consistencyIndex: metrics.overall.consistencyIndex,
          compositeScore: metrics.overall.compositeScore
        }
      };

      console.log('Storing metrics:', formattedMetrics);

      try {
        // Store metrics in backend
        const response = await goNoGoService.storeMetrics('test_user_123', formattedMetrics);
        console.log('Metrics stored successfully:', response);
      } catch (error) {
        console.error('Failed to store metrics:', error);
        // Continue with game completion even if metrics storage fails
      }

      // Send metrics to parent component
      onComplete?.(formattedMetrics);

      // Complete game in progress context
      completeGame('go-no-go', metrics.overall.performanceScore);

    } catch (error) {
      console.error('Error completing game:', error);
      alert('Failed to complete game. Please try again.');
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (stimulusTimeoutRef.current) clearTimeout(stimulusTimeoutRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    if (!gameStarted || !isWaiting) return;
    handleResponse(true);
  }, [gameStarted, isWaiting, handleResponse]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-start p-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2 text-white">Go/No-Go Challenge</h1>
        <div className="flex gap-4 justify-center">
          <div className="px-4 py-2 bg-violet-600 rounded-lg">
            Round: {gameState.totalRounds + 1}/{gameConfig.roundsToWin}
          </div>
          <div className="px-4 py-2 bg-violet-600 rounded-lg">
            Score: {gameState.score}
          </div>
          <div className="px-4 py-2 bg-violet-600 rounded-lg">
            Streak: {gameState.streak}
          </div>
        </div>
      </div>

      {!gameStarted ? (
        <div className="flex flex-col items-center justify-center mt-4">
          <button
            onClick={startGame}
            className="px-6 py-3 bg-green-500 text-white rounded-lg text-xl hover:bg-green-600 transition-colors"
          >
            Start Game
          </button>
          <div className="mt-4 text-gray-300 text-center max-w-md">
            <p className="mb-2">Tap when you see a "Go" signal! Hold back for "No-Go" signals.</p>
            <p className="text-sm">🟢 = Go! | 🔴 = Stop!</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
          <div className="relative w-64 h-64 bg-gray-800 rounded-xl flex items-center justify-center">
            <GameStimulus
              stimulus={currentStimulus}
              onClick={handleClick}
              disabled={!isWaiting}
            />

            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 flex items-center justify-center bg-opacity-50 rounded-xl ${
                    showFeedback === 'correct' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <span className="text-6xl text-white">
                    {showFeedback === 'correct' ? '✓' : '✗'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ScoreDisplay score={gameState.score} speed={gameState.currentSpeed} />

          <div className="text-center text-gray-300">
            <p>React quickly to "Go" signals, but hold back for "No-Go" signals!</p>
            <p className="text-sm mt-1">Speed: {Math.round(gameState.currentSpeed)}ms</p>
          </div>
        </div>
      )}

      {/* Game Complete Modal */}
      {isGameComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg text-center">
            <h2 className="text-xl font-bold mb-2">Cognitive Assessment Complete</h2>
            <div className="space-y-2 mb-4">
              {/* Inhibition Metrics */}
              <div className="border-b pb-2">
                <h3 className="font-semibold text-blue-600">Response Inhibition</h3>
                <p className="text-sm">
                  Accuracy: {Math.round(calculateGoNoGoMetrics(gameState).inhibition.accuracy)}%
                </p>
                <p className="text-sm">
                  False Alarms: {calculateGoNoGoMetrics(gameState).inhibition.falseAlarms}
                </p>
              </div>
              
              {/* Attention Metrics */}
              <div className="border-b pb-2">
                <h3 className="font-semibold text-purple-600">Attention Control</h3>
                <p className="text-sm">
                  Sustained Attention: {Math.round(calculateGoNoGoMetrics(gameState).attention.sustainedAttention)}%
                </p>
                <p className="text-sm">
                  Focus Quality: {Math.round(calculateGoNoGoMetrics(gameState).attention.focusQuality)}%
                </p>
              </div>

              {/* Processing Metrics */}
              <div className="border-b pb-2">
                <h3 className="font-semibold text-green-600">Processing Speed</h3>
                <p className="text-sm">
                  Average RT: {Math.round(calculateGoNoGoMetrics(gameState).processing.averageReactionTime)}ms
                </p>
                <p className="text-sm">
                  Efficiency: {Math.round(calculateGoNoGoMetrics(gameState).processing.processingEfficiency)}%
                </p>
              </div>

              {/* Learning Metrics */}
              <div className="border-b pb-2">
                <h3 className="font-semibold text-yellow-600">Learning & Adaptation</h3>
                <p className="text-sm">
                  Learning Rate: {Math.round(calculateGoNoGoMetrics(gameState).learning.learningRate)}%
                </p>
                <p className="text-sm">
                  Adaptation: {Math.round(calculateGoNoGoMetrics(gameState).learning.adaptationQuality)}%
                </p>
              </div>

              {/* Overall Score */}
              <div>
                <h3 className="font-semibold text-indigo-600">Overall Performance</h3>
                <p className="text-sm">
                  Score: {Math.round(calculateGoNoGoMetrics(gameState).overall.performanceScore)}%
                </p>
                <p className="text-sm">
                  Consistency: {Math.round(calculateGoNoGoMetrics(gameState).overall.consistencyIndex)}%
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Moving to next assessment...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoNoGoGame; 