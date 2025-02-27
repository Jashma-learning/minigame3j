import React, { useState, useEffect, useCallback } from 'react';
import PatternDisplay from './components/PatternDisplay';
import Grid from './components/Grid';

type GamePhase = 'memorize' | 'input' | 'feedback' | 'complete';

interface GameState {
  phase: GamePhase;
  timeLeft: number;
  pattern: number[][];
  playerPattern: number[][];
  showHint: { row: number; col: number } | null;
}

interface PatternPuzzleGameProps {
  onComplete: (score: number) => void;
}

const PatternPuzzleGame: React.FC<PatternPuzzleGameProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'memorize',
    timeLeft: 5,
    pattern: generatePattern(4),
    playerPattern: Array(4).fill(Array(4).fill(0)),
    showHint: null,
  });

  const [score, setScore] = useState(0);

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

  const checkPattern = useCallback(() => {
    const isCorrect = gameState.pattern.every((row, i) =>
      row.every((cell, j) => cell === gameState.playerPattern[i][j])
    );

    if (isCorrect) {
      const finalScore = calculateScore(gameState.timeLeft);
      setScore(finalScore);
      setGameState(prev => ({
        ...prev,
        phase: 'complete',
      }));
      onComplete(finalScore);
    } else {
      // Find first difference for hint
      let hintCell = null;
      for (let i = 0; i < gameState.pattern.length; i++) {
        for (let j = 0; j < gameState.pattern[i].length; j++) {
          if (gameState.pattern[i][j] !== gameState.playerPattern[i][j]) {
            hintCell = { row: i, col: j };
            break;
          }
        }
        if (hintCell) break;
      }

      setGameState(prev => ({
        ...prev,
        phase: 'feedback',
        showHint: hintCell,
      }));

      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          phase: 'input',
          showHint: null,
        }));
      }, 1000);
    }
  }, [gameState.pattern, gameState.playerPattern, gameState.timeLeft, onComplete]);

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="text-2xl font-bold text-white">
        {gameState.phase === 'memorize' && `Memorize: ${gameState.timeLeft}s`}
        {gameState.phase === 'input' && 'Recreate the pattern'}
        {gameState.phase === 'feedback' && 'Try again!'}
        {gameState.phase === 'complete' && 'Well done!'}
      </div>

      <div className="relative">
        {gameState.phase === 'memorize' && (
          <PatternDisplay pattern={gameState.pattern} />
        )}
        {(gameState.phase === 'input' || gameState.phase === 'feedback') && (
          <Grid
            pattern={gameState.playerPattern}
            onCellClick={handleCellClick}
            interactive={gameState.phase === 'input'}
            showHint={gameState.showHint}
          />
        )}
        {gameState.phase === 'complete' && (
          <PatternDisplay pattern={gameState.pattern} />
        )}
      </div>

      {gameState.phase === 'input' && (
        <button
          className="px-6 py-2 text-lg font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors"
          onClick={checkPattern}
        >
          Check Pattern
        </button>
      )}
    </div>
  );
};

const calculateScore = (timeLeft: number): number => {
  // Base score for completing the pattern
  const baseScore = 1000;
  // Bonus points for remaining time (up to 500 points)
  const timeBonus = Math.floor(timeLeft * 100);
  return baseScore + timeBonus;
};

export default PatternPuzzleGame;

function generatePattern(size: number): number[][] {
  const pattern = Array(size).fill(0).map(() => Array(size).fill(0));
  const numCells = Math.floor(size * size * 0.4); // Fill ~40% of cells

  for (let i = 0; i < numCells; i++) {
    let row, col;
    do {
      row = Math.floor(Math.random() * size);
      col = Math.floor(Math.random() * size);
    } while (pattern[row][col] === 1);
    pattern[row][col] = 1;
  }

  return pattern;
} 