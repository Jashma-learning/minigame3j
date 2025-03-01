import React from 'react';
import { motion } from 'framer-motion';
import { WordBankProps } from '../types';

const WordBank: React.FC<WordBankProps> = ({
  availableWords,
  selectedWords,
  onWordSelect,
}) => {
  return (
    <div className="bg-violet-800/70 p-4 rounded-xl">
      <h3 className="text-lg font-bold mb-3 text-violet-100">Word Bank</h3>
      <div className="flex flex-wrap gap-1.5">
        {availableWords.map((word, index) => {
          const isSelected = selectedWords.includes(word);
          return (
            <motion.button
              key={`${word}-${index}`}
              onClick={() => onWordSelect(word)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-2.5 py-1 rounded-lg text-sm font-medium
                transition-colors duration-200
                ${
                  isSelected
                    ? 'bg-green-500/80 text-white'
                    : 'bg-violet-600/80 text-violet-100 hover:bg-violet-500/80'
                }
              `}
            >
              {word}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default WordBank; 