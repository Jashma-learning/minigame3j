import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PatternDisplay from './components/PatternDisplay';
import Grid from './components/Grid';
import { generatePattern, calculatePatternComplexity } from './utils/patternUtils';

type GamePhase = 'memorize' | 'input' | 'feedback' | 'complete';

interface GameState {
  phase: GamePhase;
  timeLeft: number;
  pattern: number[][];
  playerPattern: number[][];
  showHint: { row: number; col: number } | null;
  level: number;
  hintsRemaining: number;
}

interface PatternPuzzleGameProps {
  onComplete: (score: number) => void;
}

const PatternPuzzleGame: React.FC<PatternPuzzleGameProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialPattern = generatePattern(1);
    return {
      phase: 'memorize',
      timeLeft: 5,
      pattern: initialPattern,
      playerPattern: Array(initialPattern.length).fill(0).map(() => Array(initialPattern.length).fill(0)),
      showHint: null,
      level: 1,
      hintsRemaining: 3,
    };
  });

  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;
  const [isPatternCorrect, setIsPatternCorrect] = useState<boolean>(false);

  useEffect(() => {
    if (gameState.phase === 'memorize' && gameState.timeLeft > 0) {
      const timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);

      return () => clearInterval(timer);
    }

    if (gameState.phase === 'memorize' && gameState.timeLeft <= 0) {
      setGameState(prev => ({
        ...prev,
        phase: 'input',
      }));
    }
  }, [gameState.phase, gameState.timeLeft]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.phase !== 'input') return;

    setGameState(prev => {
      const newPlayerPattern = prev.playerPattern.map(r => [...r]);
      newPlayerPattern[row][col] = newPlayerPattern[row][col] ? 0 : 1;
      return { ...prev, playerPattern: newPlayerPattern };
    });
  }, [gameState.phase]);

  const useHint = useCallback(() => {
    if (gameState.hintsRemaining <= 0) return;

    setGameState(prev => ({
      ...prev,
      hintsRemaining: prev.hintsRemaining - 1,
      showHint: findFirstDifference(gameState.pattern, gameState.playerPattern),
    }));

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        showHint: null,
      }));
    }, 2000);
  }, [gameState.pattern, gameState.playerPattern, gameState.hintsRemaining]);

  const checkPattern = () => {
    const correct = gameState.pattern.every((row, i) =>
      row.every((cell, j) => cell === gameState.playerPattern[i][j])
    );
    setIsPatternCorrect(correct);

    if (correct) {
      const timeBonus = Math.floor(gameState.timeLeft * 100);
      const patternComplexity = calculatePatternComplexity(gameState.pattern);
      const levelBonus = gameState.level * 200;
      const finalScore = 1000 + timeBonus + patternComplexity + levelBonus;
      
      setScore(prev => prev + finalScore);
      
      if (gameState.level >= 10) {
        setGameState(prev => ({
          ...prev,
          phase: 'complete'
        }));
        onComplete(score + finalScore);
      } else {
        setGameState(prev => ({
          ...prev,
          phase: 'feedback'
        }));
      }
    } else {
      setAttempts(prev => prev + 1);
      if (attempts + 1 >= maxAttempts) {
        setGameState(prev => ({
          ...prev,
          phase: 'complete'
        }));
        onComplete(score);
      } else {
        setGameState(prev => ({
          ...prev,
          phase: 'feedback'
        }));
      }
    }
  };

  const startNextLevel = () => {
    const nextLevel = gameState.level + 1;
    const newPattern = generatePattern(nextLevel);
    setGameState({
      phase: 'memorize',
      timeLeft: 5 + Math.floor(nextLevel / 2), // Increase time with level
      pattern: newPattern,
      playerPattern: Array(newPattern.length).fill(0).map(() => Array(newPattern.length).fill(0)),
      showHint: null,
      level: nextLevel,
      hintsRemaining: Math.max(0, gameState.hintsRemaining + 1), // Award an extra hint
    });
    setIsPatternCorrect(false);
    setAttempts(0);
  };

  const resetLevel = () => {
    setGameState(prev => ({
      ...prev,
      phase: 'memorize',
      timeLeft: 5 + Math.floor(prev.level / 2),
      playerPattern: Array(prev.pattern.length).fill(0).map(() => Array(prev.pattern.length).fill(0)),
      showHint: null,
      hintsRemaining: 3,
    }));
    setIsPatternCorrect(false);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-2">
      <div className="w-full max-w-4xl px-4 flex flex-col items-center">
        {/* Game Header */}
        <div className="w-full text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pattern Puzzle</h1>
          <p className="text-sm text-gray-600 mb-2">Memorize and recreate the pattern</p>
          <div className="flex gap-2 justify-center">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Level {gameState.level}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              Hints: {gameState.hintsRemaining}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Time: {gameState.timeLeft}s
            </span>
          </div>
        </div>

        {/* Game Container */}
        <div className="w-full aspect-square max-w-2xl bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <div className="w-full h-full relative">
            {gameState.phase === 'memorize' ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-xl font-bold text-gray-800 mb-4">
                  Memorize the Pattern
                </div>
                <PatternDisplay pattern={gameState.pattern} />
                <div className="text-3xl font-bold text-gray-800 mt-4">
                  {gameState.timeLeft}s
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Grid
                  pattern={gameState.playerPattern}
                  onCellClick={handleCellClick}
                  interactive={gameState.phase === 'input'}
                  showHint={gameState.showHint}
                />
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={useHint}
                    disabled={gameState.hintsRemaining === 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Use Hint ({gameState.hintsRemaining})
                  </button>
                  <button
                    onClick={checkPattern}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Level Button */}
        {gameState.phase === 'feedback' && (
          <div className="mt-4 flex flex-col items-center">
            <div className={`text-xl font-bold mb-2 ${isPatternCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isPatternCorrect ? 'Pattern Correct!' : 'Pattern Incorrect'}
            </div>
            <button
              onClick={() => {
                if (isPatternCorrect) {
                  startNextLevel();
                } else {
                  resetLevel();
                }
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              {isPatternCorrect ? (
                <>
                  Next Level
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              ) : (
                'Try Again'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const findFirstDifference = (pattern: number[][], playerPattern: number[][]): { row: number; col: number } | null => {
  for (let i = 0; i < pattern.length; i++) {
    for (let j = 0; j < pattern[i].length; j++) {
      if (pattern[i][j] !== playerPattern[i][j]) {
        return { row: i, col: j };
      }
    }
  }
  return null;
};

export default PatternPuzzleGame; 