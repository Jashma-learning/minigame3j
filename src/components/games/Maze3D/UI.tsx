import React from 'react';
import { motion } from 'framer-motion';

interface UIProps {
  score: number;
  time: string;
  isPaused: boolean;
  onPause: () => void;
  onRestart: () => void;
}

export default function UI({ score, time, isPaused, onPause, onRestart }: UIProps) {
  return (
    <>
      {/* Game HUD */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 p-4 pointer-events-none"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          {/* Score and Time */}
          <motion.div 
            className="bg-black/60 backdrop-blur-md rounded-2xl p-6 text-white shadow-lg border border-white/10
                     hover:border-purple-500/30 transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="flex gap-12">
              <div>
                <div className="text-sm font-medium text-purple-300 mb-1">Score</div>
                <motion.div 
                  key={score}
                  initial={{ scale: 1.2, color: "#a855f7" }}
                  animate={{ scale: 1, color: "#ffffff" }}
                  className="text-3xl font-bold"
                >
                  {score}
                </motion.div>
              </div>
              <div>
                <div className="text-sm font-medium text-purple-300 mb-1">Time</div>
                <div className="text-3xl font-bold font-mono">{time}</div>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <div className="pointer-events-auto flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPause}
              className="px-6 py-3 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl
                       text-white font-medium transition-all duration-200
                       border border-white/10 hover:border-purple-500/30
                       shadow-lg hover:shadow-purple-500/20"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRestart}
              className="px-6 py-3 bg-purple-600/80 hover:bg-purple-700/80 backdrop-blur-md
                       rounded-xl text-white font-medium transition-all duration-200
                       border border-purple-400/20 hover:border-purple-400/40
                       shadow-lg hover:shadow-purple-500/40"
            >
              Restart
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Start Screen */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
      >
        <motion.div 
          className="text-center bg-black/60 backdrop-blur-md p-10 rounded-3xl
                    transform transition-all duration-300 shadow-2xl
                    border border-white/10 hover:border-purple-500/30"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <motion.h1 
            className="text-5xl font-bold text-white mb-4"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            3D Maze Challenge
          </motion.h1>
          <motion.div 
            className="text-xl text-purple-300 mb-10"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Collect all items and find your way out!
          </motion.div>
          <div className="space-y-4 text-gray-300">
            <motion.div 
              className="flex items-center justify-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <kbd className="px-3 py-1.5 bg-white/10 rounded-lg font-mono">WASD</kbd>
              <span>to move</span>
            </motion.div>
            <motion.div 
              className="flex items-center justify-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <kbd className="px-3 py-1.5 bg-white/10 rounded-lg font-mono">SHIFT</kbd>
              <span>to run</span>
            </motion.div>
            <motion.div 
              className="flex items-center justify-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <kbd className="px-3 py-1.5 bg-white/10 rounded-lg font-mono">SPACE</kbd>
              <span>to jump</span>
            </motion.div>
          </div>
          <motion.div 
            className="mt-10 text-purple-400 text-xl font-medium"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [1, 0.7, 1] 
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Click to Start
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Mini-map */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        className="fixed top-4 right-4 w-52 h-52 bg-black/60 backdrop-blur-md rounded-2xl p-3
                  border-2 border-purple-500/30 shadow-xl hover:border-purple-500/50 transition-colors duration-300"
      >
        <div className="w-full h-full bg-black/40 rounded-xl relative overflow-hidden">
          <div className="absolute top-3 left-3 text-sm text-purple-300 font-medium
                        bg-black/40 px-2 py-1 rounded-md">
            Mini-map
          </div>
        </div>
      </motion.div>
    </>
  );
} 