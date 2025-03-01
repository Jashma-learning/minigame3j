import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  id: string;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ icon, isFlipped, isMatched, onClick }) => {
  return (
    <div
      className={`
        aspect-square w-full
        cursor-pointer
        perspective-1000
        transition-transform
        duration-500
        transform-gpu
        ${isMatched ? 'opacity-50' : 'opacity-100'}
      `}
      onClick={onClick}
    >
      <div
        className={`
          relative w-full h-full
          transition-transform
          duration-500
          transform-style-preserve-3d
          ${isFlipped ? 'rotate-y-180' : ''}
        `}
      >
        {/* Front */}
        <div
          className={`
            absolute w-full h-full
            flex items-center justify-center
            bg-white rounded-lg shadow
            border-2 border-gray-200
            text-3xl
            backface-hidden
          `}
        >
          ❓
        </div>

        {/* Back */}
        <div
          className={`
            absolute w-full h-full
            flex items-center justify-center
            bg-white rounded-lg shadow
            border-2 border-blue-200
            text-3xl
            backface-hidden
            rotate-y-180
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Card; 