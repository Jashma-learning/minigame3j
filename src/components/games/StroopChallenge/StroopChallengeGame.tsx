import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StroopWord {
  text: string;
  displayColor: string;
  correctColor: string;
}

interface GameConfig {
  responseTimeLimit: number;
  showDistractions: boolean;
  roundsToWin: number;
}

type ColorName = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

const COLORS: Record<ColorName, string> = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  purple: '#8B5CF6'
};

const COLOR_NAMES = Object.keys(COLORS) as ColorName[];

interface StroopChallengeGameProps {
  onComplete: (score: number) => void;
}

const StroopChallengeGame: React.FC<StroopChallengeGameProps> = ({ onComplete }) => {
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    responseTimeLimit: 3000, // Start with 3 seconds
    showDistractions: false,
    roundsToWin: 10
  });

  const [currentWord, setCurrentWord] = useState<StroopWord | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [distractions, setDistractions] = useState<{ x: number; y: number; color: string }[]>([]);

  const generateWord = useCallback(() => {
    const textColor = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
    let displayColor;
    do {
      displayColor = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
    } while (displayColor === textColor);

    return {
      text: textColor.charAt(0).toUpperCase() + textColor.slice(1),
      displayColor: COLORS[displayColor],
      correctColor: COLORS[textColor]
    };
  }, []);

  const generateDistractions = useCallback(() => {
    if (!gameConfig.showDistractions) return [];
    
    return Array.from({ length: 5 }, () => ({
      x: Math.random() * 80 + 10, // 10% to 90% of container width
      y: Math.random() * 80 + 10, // 10% to 90% of container height
      color: COLORS[COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)]]
    }));
  }, [gameConfig.showDistractions]);

  const startNewRound = useCallback(() => {
    setCurrentWord(generateWord());
    setTimeLeft(gameConfig.responseTimeLimit);
    setShowResult(null);
    if (gameConfig.showDistractions) {
      setDistractions(generateDistractions());
    }
  }, [gameConfig, generateWord, generateDistractions]);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setStreak(0);
    setRound(0);
    startNewRound();
  };

  const handleColorClick = (selectedColor: string) => {
    if (!currentWord || !gameStarted || timeLeft === 0) return;

    const isCorrect = selectedColor === currentWord.correctColor;
    setShowResult(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      const newScore = score + Math.ceil((timeLeft! / gameConfig.responseTimeLimit) * 100);
      setScore(newScore);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Increase difficulty if player is doing well
    if (streak > 0 && streak % 3 === 0) {
      setGameConfig(prev => ({
        ...prev,
        responseTimeLimit: Math.max(1000, prev.responseTimeLimit - 200),
        showDistractions: streak >= 5
      }));
    }

    const nextRound = round + 1;
    setRound(nextRound);

    if (nextRound >= gameConfig.roundsToWin) {
      setGameStarted(false);
      setTimeout(() => {
        onComplete(score);
      }, 1000);
    } else {
      setTimeout(() => {
        startNewRound();
      }, 1000);
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 10;
        });
      }, 10);

      return () => clearInterval(timer);
    }
  }, [gameStarted, timeLeft]);

  // Time's up effect
  useEffect(() => {
    if (timeLeft === 0) {
      setShowResult('wrong');
      setStreak(0);
      setTimeout(() => {
        if (round < gameConfig.roundsToWin - 1) {
          startNewRound();
        }
      }, 1000);
    }
  }, [timeLeft, round, gameConfig.roundsToWin, startNewRound]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-white">Stroop Challenge</h1>
        <div className="flex gap-4 justify-center mb-4">
          <div className="px-4 py-2 bg-purple-700 rounded-lg">
            Score: {score}
          </div>
          <div className="px-4 py-2 bg-purple-700 rounded-lg">
            Round: {round + 1}/{gameConfig.roundsToWin}
          </div>
          <div className="px-4 py-2 bg-purple-700 rounded-lg">
            Streak: {streak}
          </div>
        </div>
      </div>

      {!gameStarted ? (
        <button
          onClick={startGame}
          className="px-6 py-3 bg-green-500 text-white rounded-lg text-xl hover:bg-green-600 transition-colors"
        >
          Start Game
        </button>
      ) : (
        <div className="relative w-full max-w-2xl aspect-video bg-gray-800 rounded-xl overflow-hidden">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-700">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: gameConfig.responseTimeLimit / 1000, ease: 'linear' }}
            />
          </div>

          {/* Distractions */}
          <AnimatePresence>
            {gameConfig.showDistractions && distractions.map((d, i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-8 rounded-full opacity-20"
                style={{ 
                  backgroundColor: d.color,
                  left: `${d.x}%`,
                  top: `${d.y}%`
                }}
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ))}
          </AnimatePresence>

          {/* Main word display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {currentWord && (
                <motion.div
                  key={currentWord.text + currentWord.displayColor}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="text-6xl font-bold"
                  style={{ color: currentWord.displayColor }}
                >
                  {currentWord.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Result overlay */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 flex items-center justify-center bg-opacity-50 ${
                  showResult === 'correct' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                <span className="text-4xl font-bold text-white">
                  {showResult === 'correct' ? '✓' : '✗'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Color buttons */}
      <div className="grid grid-cols-5 gap-4 mt-8">
        {Object.entries(COLORS).map(([name, color]) => (
          <button
            key={name}
            onClick={() => handleColorClick(color)}
            disabled={!gameStarted || showResult !== null}
            className="w-16 h-16 rounded-full shadow-lg transform hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="mt-8 text-gray-300 text-center">
        <p>Click the button matching the COLOR NAME, not the color you see!</p>
        <p className="text-sm mt-2">Example: If you see "Red" written in blue, click the red button.</p>
      </div>
    </div>
  );
};

export default StroopChallengeGame; 