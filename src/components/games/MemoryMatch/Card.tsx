import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ icon, isFlipped, isMatched, onClick }) => {
  return (
    <motion.div
      className={`relative w-24 h-24 cursor-pointer ${isMatched ? 'pointer-events-none' : ''}`}
      onClick={onClick}
      whileHover={{ scale: isFlipped ? 1 : 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full h-full"
        initial={false}
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{ duration: 0.6 }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front of card */}
        <div
          className={`absolute w-full h-full flex items-center justify-center 
                     bg-white rounded-xl shadow-lg border-2 border-blue-300
                     ${isMatched ? 'opacity-50' : ''}`}
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <span className="text-3xl">❓</span>
        </div>

        {/* Back of card (icon) */}
        <div
          className="absolute w-full h-full flex items-center justify-center 
                     bg-blue-100 rounded-xl shadow-lg border-2 border-blue-300"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className="text-4xl">{icon}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Card; 