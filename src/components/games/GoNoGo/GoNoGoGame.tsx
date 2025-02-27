import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateStimulus } from './utils/gameUtils';
import GameStimulus from './components/GameStimulus';
import ScoreDisplay from './components/ScoreDisplay';

interface GoNoGoGameProps {
  onComplete: (score: number) => void;
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
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStimulus, setCurrentStimulus] = useState<{
    type: 'go' | 'no-go';
    symbol: string;
    color: string;
  } | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_CONFIG.initialSpeed);
  const [isWaiting, setIsWaiting] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const stimulusTimeoutRef = useRef<NodeJS.Timeout>();

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    setRound(0);
    setStreak(0);
    setSpeed(INITIAL_CONFIG.initialSpeed);
    setIsWaiting(false);
    startNewRound();
  }, []);

  const startNewRound = useCallback(() => {
    if (round >= gameConfig.roundsToWin) {
      setGameStarted(false);
      onComplete(score);
      return;
    }

    const stimulus = generateStimulus(gameConfig.goRatio);
    setCurrentStimulus(stimulus);
    setShowFeedback(null);
    setIsWaiting(true);

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
    }, speed);
  }, [round, gameConfig, speed, score, onComplete]);

  const handleResponse = useCallback((responded: boolean) => {
    if (!isWaiting || !currentStimulus) return;
    setIsWaiting(false);

    const isCorrect = (currentStimulus.type === 'go' && responded) || 
                     (currentStimulus.type === 'no-go' && !responded);

    setShowFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      const roundScore = 100 + (streak * 10);
      setScore(prev => prev + roundScore);
      setStreak(prev => prev + 1);

      // Increase difficulty
      if (streak > 0 && streak % 3 === 0) {
        setSpeed(prev => Math.max(gameConfig.minSpeed, prev - 100));
      }
    } else {
      setStreak(0);
    }

    // Clear stimulus timeout
    if (stimulusTimeoutRef.current) {
      clearTimeout(stimulusTimeoutRef.current);
    }

    // Show feedback and proceed to next round
    timeoutRef.current = setTimeout(() => {
      setRound(prev => prev + 1);
      startNewRound();
    }, 1000);
  }, [currentStimulus, isWaiting, streak, gameConfig.minSpeed, startNewRound]);

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
            Round: {round + 1}/{gameConfig.roundsToWin}
          </div>
          <div className="px-4 py-2 bg-violet-600 rounded-lg">
            Score: {score}
          </div>
          <div className="px-4 py-2 bg-violet-600 rounded-lg">
            Streak: {streak}
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

          <ScoreDisplay score={score} speed={speed} />

          <div className="text-center text-gray-300">
            <p>React quickly to "Go" signals, but hold back for "No-Go" signals!</p>
            <p className="text-sm mt-1">Speed: {Math.round(speed)}ms</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoNoGoGame; 