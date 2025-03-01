import React from 'react';
import { useRouter } from 'next/navigation';
import { GameSpecificMetrics } from '../types/cognitiveMetrics';
import { GameMetrics } from '../types/metrics';
import MetricsDisplay from './MetricsDisplay';
import { gameSeriesConfig } from '../utils/gameSeriesConfig';

export interface GameSubmissionProps {
  isComplete: boolean;
  onSubmit: () => void;
  gameMetrics: Partial<GameSpecificMetrics> | GameMetrics;
  nextGame?: string;
  isLastGame?: boolean;
  currentGameId: string;
}

const GameSubmission: React.FC<GameSubmissionProps> = ({
  isComplete,
  onSubmit,
  gameMetrics,
  nextGame,
  isLastGame,
  currentGameId
}) => {
  const router = useRouter();
  const currentGameIndex = gameSeriesConfig.findIndex(game => game.id === currentGameId);
  const totalGames = gameSeriesConfig.length;

  const handleNext = async () => {
    try {
      // First submit the metrics
      onSubmit();
      
      // Small delay to ensure metrics are saved
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Then handle navigation
      if (isLastGame) {
        router.push('/progress');
      } else if (nextGame) {
        router.push(nextGame);
      }
    } catch (error) {
      console.error('Error during game completion:', error);
    }
  };

  if (!isComplete) return null;

  // Convert raw metrics to BaseMetric format if needed
  const formattedMetrics = Object.entries(gameMetrics).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: typeof value === 'object' ? value : { value, timestamp: Date.now() }
  }), {});

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 mx-4 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-center">
          {isLastGame ? 'Complete Game Series!' : 'Game Complete!'}
        </h3>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Your Performance:</h4>
          <MetricsDisplay metrics={formattedMetrics} />
        </div>

        <div className="text-sm text-gray-500 mb-4 text-center">
          Game {currentGameIndex + 1} of {totalGames}
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLastGame ? 'View Progress' : 'Continue to Next Game'}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GameSubmission; 