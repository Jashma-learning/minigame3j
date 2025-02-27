import React from 'react';
import { motion } from 'framer-motion';

interface GameControlsProps {
  level: number;
  score: number;
  attempts: number;
  maxAttempts: number;
  onHint?: () => void;
  onReset?: () => void;
  hintsRemaining?: number;
}

export default function GameControls({
  level,
  score,
  attempts,
  maxAttempts,
  onHint,
  onReset,
  hintsRemaining = 0
}: GameControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      {/* Stats Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-800/50 px-6 py-4 rounded-lg text-center">
          <div className="text-sm text-purple-300">Level</div>
          <motion.div
            key={level}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold"
          >
            {level}
          </motion.div>
        </div>

        <div className="bg-purple-800/50 px-6 py-4 rounded-lg text-center">
          <div className="text-sm text-purple-300">Score</div>
          <motion.div
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold"
          >
            {score}
          </motion.div>
        </div>

        <div className="bg-purple-800/50 px-6 py-4 rounded-lg text-center">
          <div className="text-sm text-purple-300">Attempts</div>
          <div className="text-2xl font-bold">
            {maxAttempts - attempts}/{maxAttempts}
          </div>
        </div>

        <div className="bg-purple-800/50 px-6 py-4 rounded-lg text-center">
          <div className="text-sm text-purple-300">Hints</div>
          <div className="text-2xl font-bold">{hintsRemaining}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {onHint && hintsRemaining > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onHint}
            className="px-6 py-3 bg-yellow-600/80 hover:bg-yellow-700/80 rounded-lg
                     text-white font-medium transition-colors duration-200"
          >
            Use Hint ({hintsRemaining})
          </motion.button>
        )}

        {onReset && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="px-6 py-3 bg-purple-600/80 hover:bg-purple-700/80 rounded-lg
                     text-white font-medium transition-colors duration-200"
          >
            Reset Pattern
          </motion.button>
        )}
      </div>

      {/* Level Progress */}
      <div className="relative h-2 bg-purple-900/50 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-purple-400"
          initial={{ width: 0 }}
          animate={{ width: `${(score / (level * 1000)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
} 