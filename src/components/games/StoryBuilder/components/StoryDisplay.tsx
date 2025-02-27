import React from 'react';
import { motion } from 'framer-motion';
import { StoryDisplayProps } from '../types';

const StoryDisplay: React.FC<StoryDisplayProps> = ({
  template,
  selectedWords,
  onWordClick,
}) => {
  const words = template.split(/(__\w+__)/g);

  return (
    <div className="bg-violet-800 p-6 rounded-xl shadow-lg">
      <div className="prose prose-lg prose-invert">
        {words.map((word, index) => {
          if (word.match(/^__\w+__$/)) {
            const placeholder = word.replace(/__/g, '');
            const selectedWord = selectedWords[parseInt(placeholder.replace('BLANK', '')) - 1];

            return (
              <motion.span
                key={index}
                initial={{ backgroundColor: 'rgba(139, 92, 246, 0.3)' }}
                animate={{
                  backgroundColor: selectedWord
                    ? 'rgba(34, 197, 94, 0.3)'
                    : 'rgba(139, 92, 246, 0.3)',
                }}
                className="inline-block px-2 py-1 mx-1 rounded cursor-pointer"
                onClick={() => selectedWord && onWordClick(selectedWord)}
              >
                {selectedWord || '________'}
              </motion.span>
            );
          }
          return <span key={index}>{word}</span>;
        })}
      </div>
    </div>
  );
};

export default StoryDisplay; 