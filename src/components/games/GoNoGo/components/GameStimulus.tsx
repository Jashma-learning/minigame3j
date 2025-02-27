import React from 'react';
import { motion } from 'framer-motion';

interface GameStimulusProps {
  stimulus: {
    type: 'go' | 'no-go';
    symbol: string;
    color: string;
  } | null;
  onClick: () => void;
  disabled: boolean;
}

const GameStimulus: React.FC<GameStimulusProps> = ({ stimulus, onClick, disabled }) => {
  if (!stimulus) return null;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-48 h-48 rounded-full
        flex items-center justify-center
        text-7xl
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
      style={{
        backgroundColor: stimulus.color,
        boxShadow: `0 0 20px ${stimulus.color}`,
      }}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <span role="img" aria-label={stimulus.type}>
        {stimulus.symbol}
      </span>
    </motion.button>
  );
};

export default GameStimulus; 