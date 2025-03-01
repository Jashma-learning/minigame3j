import React from 'react';

interface ControlsProps {
  gameState: {
    phase: 'instruction' | 'playing' | 'feedback' | 'complete';
    level: number;
    score: number;
  };
  onStart: () => void;
  onCheck: () => void;
  onNextLevel: () => void;
}

export default function Controls({
  gameState,
  onStart,
  onCheck,
  onNextLevel
}: ControlsProps) {
  if (gameState.phase === 'instruction') {
    return (
      <div className="flex flex-col items-center max-w-md">
        <p className="text-gray-600 text-center text-sm mb-3">
          Rotate the blue cube to match the orientation of the transparent target cube.
          Use your mouse to drag and rotate the object.
        </p>
        <button
          onClick={onStart}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          Start Game
        </button>
      </div>
    );
  }

  if (gameState.phase === 'playing') {
    return (
      <button
        onClick={onCheck}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
      >
        Check Orientation
      </button>
    );
  }

  if (gameState.phase === 'feedback') {
    return (
      <button
        onClick={onNextLevel}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
      >
        Next Level
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    );
  }

  if (gameState.phase === 'complete') {
    return (
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-bold text-gray-800 mb-1">
          Game Complete!
        </h2>
        <p className="text-gray-600 text-sm mb-3">
          Final Score: {gameState.score}
        </p>
        <button
          onClick={onStart}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Play Again
        </button>
      </div>
    );
  }

  return null;
} 