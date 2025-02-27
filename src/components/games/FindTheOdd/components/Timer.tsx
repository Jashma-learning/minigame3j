import React from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime }) => {
  const progress = (timeLeft / totalTime) * 100;
  const isLowTime = timeLeft <= 5;

  return (
    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${isLowTime ? 'bg-red-500' : 'bg-blue-500'}`}
        initial={{ width: '100%' }}
        animate={{ 
          width: `${progress}%`,
        }}
        transition={{ 
          duration: 1,
          ease: 'linear'
        }}
      />
    </div>
  );
};

export default Timer; 