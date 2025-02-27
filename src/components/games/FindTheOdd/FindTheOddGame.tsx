import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateRound } from './utils/gameUtils';
import ItemGrid from './components/ItemGrid';
import Timer from './components/Timer';

interface FindTheOddGameProps {
  onComplete: (score: number) => void;
}

interface GameConfig {
  gridSize: number;
  timeLimit: number;
  roundsToWin: number;
  categories: string[];
}

const INITIAL_CONFIG: GameConfig = {
  gridSize: 9, // 3x3 grid
  timeLimit: 15, // 15 seconds per round
  roundsToWin: 10,
  categories: ['animals', 'fruits', 'shapes', 'colors', 'objects']
};

const FindTheOddGame: React.FC<FindTheOddGameProps> = ({ onComplete }) => {
  const [gameConfig, setGameConfig] = useState<GameConfig>(INITIAL_CONFIG);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_CONFIG.timeLimit);
  const [currentItems, setCurrentItems] = useState<Array<{ id: number; type: string; emoji: string }>>([]);
  const [oddOneIndex, setOddOneIndex] = useState<number>(-1);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    setRound(0);
    setStreak(0);
    startNewRound();
  }, []);

  const startNewRound = useCallback(() => {
    const { items, oddIndex } = generateRound(gameConfig.gridSize, gameConfig.categories[round % gameConfig.categories.length]);
    setCurrentItems(items);
    setOddOneIndex(oddIndex);
    setTimeLeft(gameConfig.timeLimit);
    setShowFeedback(null);
  }, [gameConfig, round]);

  const handleItemClick = useCallback((index: number) => {
    if (showFeedback !== null) return;

    const isCorrect = index === oddOneIndex;
    setShowFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      const timeBonus = Math.floor((timeLeft / gameConfig.timeLimit) * 100);
      const roundScore = 100 + timeBonus + (streak * 20);
      setScore(prev => prev + roundScore);
      setStreak(prev => prev + 1);

      // Increase difficulty
      if (streak > 0 && streak % 3 === 0) {
        setGameConfig(prev => ({
          ...prev,
          timeLimit: Math.max(5, prev.timeLimit - 2),
          gridSize: Math.min(16, prev.gridSize + 1)
        }));
      }
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= gameConfig.roundsToWin) {
        setGameStarted(false);
        onComplete(score);
      } else {
        setRound(nextRound);
        startNewRound();
      }
    }, 1000);
  }, [oddOneIndex, timeLeft, gameConfig, round, score, streak, gameConfig.roundsToWin, onComplete, startNewRound]);

  // Timer effect
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleItemClick(-1); // Force wrong answer on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStarted, timeLeft, handleItemClick]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-start p-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2 text-white">Find the Odd One</h1>
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
          <p className="mt-4 text-gray-300 text-center max-w-md">
            Find the item that doesn't belong in each group! The faster you find it, the more points you'll earn.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <Timer timeLeft={timeLeft} totalTime={gameConfig.timeLimit} />
          </div>
          
          <div className="w-full max-w-lg">
            <ItemGrid
              items={currentItems}
              gridSize={Math.sqrt(gameConfig.gridSize)}
              onItemClick={handleItemClick}
              disabled={showFeedback !== null}
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

          <div className="text-center text-gray-300">
            <p>Find the item that doesn't match the pattern!</p>
            <p className="text-sm mt-1">Tip: Look for differences in category, color, or style.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindTheOddGame; 