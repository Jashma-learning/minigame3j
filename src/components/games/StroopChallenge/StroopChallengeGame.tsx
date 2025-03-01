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
    responseTimeLimit: 3000,
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
    <div className="h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-2">
      {/* Game Header */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-white mb-0.5">Stroop Challenge</h1>
        <p className="text-gray-400 text-sm mb-1">Color-word interference challenge</p>
        <div className="flex justify-center gap-2">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
            Duration: 6-8 min
          </span>
          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">
            Difficulty: Medium
          </span>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-xl mx-auto px-3">
        {/* Game Stats */}
        <div className="flex gap-2 justify-center mb-2">
          <div className="px-2 py-0.5 bg-purple-900/50 backdrop-blur-sm rounded-full text-purple-100 text-sm font-medium">
            Score: {score}
          </div>
          <div className="px-2 py-0.5 bg-purple-900/50 backdrop-blur-sm rounded-full text-purple-100 text-sm font-medium">
            Round: {round + 1}/{gameConfig.roundsToWin}
          </div>
          <div className="px-2 py-0.5 bg-purple-900/50 backdrop-blur-sm rounded-full text-purple-100 text-sm font-medium">
            Streak: {streak}
          </div>
        </div>

        {!gameStarted ? (
          <div className="h-[50vh] flex flex-col items-center justify-center gap-3 bg-gray-800/50 rounded-lg border border-purple-500/20 backdrop-blur-sm p-4">
            <div className="text-center">
              <h2 className="text-lg font-bold mb-1 text-white">How to Play</h2>
              <p className="text-gray-300 text-sm mb-0.5">Match the word's meaning, not its color!</p>
              <p className="text-sm text-gray-400">Example: If you see "Red" written in blue, click the red button.</p>
            </div>
            <button
              onClick={startGame}
              className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-base font-semibold 
                       hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 
                       shadow-lg hover:shadow-xl"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Game Container */}
            <div className="relative aspect-[16/9] w-full bg-gray-800/90 rounded-lg overflow-hidden 
                          shadow-lg border border-purple-500/20">
              {/* Progress bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-700/50">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
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
                    className="absolute w-5 h-5 rounded-full opacity-20 blur-sm"
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
                      className="text-5xl font-bold tracking-wider"
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
                    className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm
                      ${showResult === 'correct' 
                        ? 'bg-green-500/30' 
                        : 'bg-red-500/30'}`}
                  >
                    <span className="text-4xl">
                      {showResult === 'correct' ? '✓' : '✗'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Color buttons */}
            <div className="grid grid-cols-5 gap-1.5">
              {Object.entries(COLORS).map(([name, color]) => (
                <button
                  key={name}
                  onClick={() => handleColorClick(color)}
                  disabled={!gameStarted || showResult !== null}
                  className={`
                    aspect-square rounded-lg shadow-md transform hover:scale-105 
                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                    border border-white/20 hover:border-white/30
                    ${showResult === null ? 'hover:shadow-lg hover:-translate-y-0.5' : ''}
                  `}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${name} color`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StroopChallengeGame; 