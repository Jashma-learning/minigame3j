import React from 'react';
import { useRouter } from 'next/navigation';
import { GameMetrics } from '../types/metrics';

export interface GameSubmissionProps {
  isComplete: boolean;
  onSubmit: () => void;
  gameMetrics: GameMetrics;
  nextGame?: string;
  isLastGame?: boolean;
}

const GameSubmission: React.FC<GameSubmissionProps> = ({
  isComplete,
  onSubmit,
  gameMetrics,
  nextGame,
  isLastGame
}) => {
  const router = useRouter();

  const handleSubmit = async () => {
    await onSubmit();
    
    if (nextGame) {
      router.push(`/${nextGame}`);
    }
  };

  if (!isComplete) return null;

  const formatMetricKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  };

  const formatMetricValue = (value: number, metricKey: string): string => {
    if (typeof value === 'number') {
      // Format percentages
      if (metricKey.toLowerCase().includes('accuracy')) {
        return `${value.toFixed(1)}%`;
      }
      // Format time values
      if (metricKey.toLowerCase().includes('time')) {
        return `${value.toFixed(1)}s`;
      }
    }
    return String(value);
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 mx-4 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-center">
          {isLastGame ? 'Complete Game Series!' : 'Game Complete!'}
        </h3>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Your Performance:</h4>
          <div className="space-y-2">
            {Object.entries(gameMetrics).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600">{formatMetricKey(key)}:</span>
                <span className="font-medium">{formatMetricValue(value, key)}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {isLastGame ? 'Complete Series' : 'Submit & Continue'}
        </button>
      </div>
    </div>
  );
};

export default GameSubmission; 