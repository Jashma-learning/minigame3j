import React from 'react';
import { motion } from 'framer-motion';

interface GameControlsProps {
  level: number;
  score: number;
  moves: number;
  minMoves: number;
  hints: number;
  timeElapsed: number;
  onHint: () => void;
}

export default function GameControls({
  level,
  score,
  moves,
  minMoves,
  hints,
  timeElapsed,
  onHint
}: GameControlsProps) {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-amber-800/50 rounded-lg">
      <motion.div
        className="text-center p-2"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-amber-300 text-sm mb-1">Level</div>
        <div className="text-2xl font-bold">{level}</div>
      </motion.div>

      <motion.div
        className="text-center p-2"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-amber-300 text-sm mb-1">Score</div>
        <div className="text-2xl font-bold">{score}</div>
      </motion.div>

      <motion.div
        className="text-center p-2"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-amber-300 text-sm mb-1">Moves</div>
        <div className="text-2xl font-bold">
          {moves}
          <span className="text-sm text-amber-400 ml-1">/ {minMoves}</span>
        </div>
      </motion.div>

      <motion.div
        className="text-center p-2"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-amber-300 text-sm mb-1">Time</div>
        <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
      </motion.div>

      <motion.div
        className="col-span-4 flex justify-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={onHint}
          disabled={hints <= 0}
          className={`px-4 py-2 rounded-lg transition-colors duration-200
                     ${hints > 0
                       ? 'bg-amber-600 hover:bg-amber-700'
                       : 'bg-amber-900 cursor-not-allowed'}`}
        >
          Hint ({hints} remaining)
        </button>
      </motion.div>
    </div>
  );
} 