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
    <div className="bg-violet-800/70 p-4 rounded-xl shadow-lg">
      <div className="prose prose-sm prose-invert max-w-none">
        {words.map((word, index) => {
          if (word.match(/^__\w+__$/)) {
            const placeholder = word.replace(/__/g, '');
            const selectedWord = selectedWords[parseInt(placeholder.replace('BLANK', '')) - 1];

            return (
              <motion.span
                key={index}
                initial={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
                animate={{
                  backgroundColor: selectedWord
                    ? 'rgba(34, 197, 94, 0.2)'
                    : 'rgba(139, 92, 246, 0.2)',
                }}
                className="inline-block px-2 py-0.5 mx-1 rounded cursor-pointer text-white font-medium"
                onClick={() => selectedWord && onWordClick(selectedWord)}
              >
                {selectedWord || '_____'}
              </motion.span>
            );
          }
          return <span key={index} className="text-violet-100">{word}</span>;
        })}
      </div>
    </div>
  );
};

export default StoryDisplay; 