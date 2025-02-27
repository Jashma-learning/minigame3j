import React from 'react';
import { motion } from 'framer-motion';
import { WordBankProps } from '../types';

const WordBank: React.FC<WordBankProps> = ({
  availableWords,
  selectedWords,
  onWordSelect,
}) => {
  return (
    <div className="bg-violet-700 p-4 rounded-xl">
      <h3 className="text-xl font-bold mb-4 text-white">Word Bank</h3>
      <div className="flex flex-wrap gap-2">
        {availableWords.map((word, index) => {
          const isSelected = selectedWords.includes(word);
          return (
            <motion.button
              key={`${word}-${index}`}
              onClick={() => onWordSelect(word)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium
                transition-colors duration-200
                ${
                  isSelected
                    ? 'bg-green-500 text-white'
                    : 'bg-violet-600 text-white hover:bg-violet-500'
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