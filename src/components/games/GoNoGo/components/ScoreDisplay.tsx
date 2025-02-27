import React from 'react';
import { motion } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  speed: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, speed }) => {
  // Calculate speed percentage (inverted so faster = more filled)
  const speedPercentage = Math.max(0, Math.min(100, ((2000 - speed) / 1200) * 100));

  return (
    <div className="w-full max-w-md bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-300">Current Speed</span>
        <span className="text-gray-300">{Math.round(speedPercentage)}%</span>
      </div>
      
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${speedPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-gray-300">
          <div className="text-sm">Response Time</div>
          <div className="text-lg font-bold">{speed}ms</div>
        </div>
        <div className="text-gray-300">
          <div className="text-sm">Score</div>
          <div className="text-lg font-bold">{score}</div>
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay; 