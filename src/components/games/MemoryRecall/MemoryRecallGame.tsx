import { useState, useEffect } from 'react';
import Grid from './Grid';
import DistractionGame from './DistractionGame';
import { generateRandomObjects, generateGridPositions } from '@/utils/gameUtils';
import { GamePhase, GameObject } from '@/types/game';
import DraggableObject from './DraggableObject';
import { useGameProgress } from '../../../contexts/GameProgressContext';
import { getNextGame, isLastGame } from '../../../utils/gameSeriesConfig';
import GameSubmission from '../../GameSubmission';
import { MemoryRecallMetrics } from '../../../types/metrics';

interface MemoryRecallGameProps {
  onComplete?: (metrics: MemoryRecallMetrics) => void;
}

export default function MemoryRecallGame({ onComplete }: MemoryRecallGameProps) {
  const [gamePhase, setGamePhase] = useState<GamePhase>('start');
  const [timeLeft, setTimeLeft] = useState(5);
  const [originalObjects, setOriginalObjects] = useState<GameObject[]>([]);
  const [placedObjects, setPlacedObjects] = useState<GameObject[]>([]);
  const [availableObjects, setAvailableObjects] = useState<GameObject[]>([]);
  const [distractionScore, setDistractionScore] = useState(0);
  const [firstMoveTime, setFirstMoveTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameMetrics, setGameMetrics] = useState<MemoryRecallMetrics>({
    accuracy: 0,
    explorationTime: 0,
    recallTime: 0,
    distractionScore: 0,
    hesitationTime: 0,
    totalObjects: 0,
    correctPlacements: 0
  });

  const { completeGame } = useGameProgress();
  const nextGame = getNextGame('memory-recall');

  const initializeGame = () => {
    const gridSize = 5;
    const objectCount = 3;
    const memorizationTime = 5;
    
    const positions = generateGridPositions(gridSize);
    const objects = generateRandomObjects(objectCount, positions);
    
    setOriginalObjects(objects);
    setTimeLeft(memorizationTime);
    setGamePhase('exploration');
  };

  useEffect(() => {
    if (gamePhase === 'start') {
      initializeGame();
    }
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase === 'exploration' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'exploration' && timeLeft === 0) {
      setGamePhase('distraction');
    }
  }, [gamePhase, timeLeft]);

  const handleDistractionComplete = (score: number) => {
    setDistractionScore(score);
    setAvailableObjects(originalObjects.map(obj => ({
      ...obj,
      position: [0, 0] as [number, number]
    })));
    setGamePhase('recall');
    setStartTime(Date.now());
  };

  const handleObjectPlaced = (objectId: string, position: [number, number]) => {
    if (!firstMoveTime && gamePhase === 'recall') {
      setFirstMoveTime(Date.now() - startTime);
    }

    const placedObject = availableObjects.find(obj => obj.id === objectId);
    if (placedObject) {
      setAvailableObjects(prev => prev.filter(obj => obj.id !== objectId));
      setPlacedObjects(prev => [...prev, { ...placedObject, position }]);
    }
  };

  const handleSubmit = () => {
    const correctPlacements = placedObjects.filter(obj => {
      const original = originalObjects.find(o => o.id === obj.id);
      return original?.position[0] === obj.position[0] && 
             original?.position[1] === obj.position[1];
    }).length;

    const metrics: MemoryRecallMetrics = {
      accuracy: (correctPlacements / originalObjects.length) * 100,
      explorationTime: 5 - timeLeft,
      recallTime: Date.now() - startTime,
      distractionScore,
      hesitationTime: firstMoveTime || 0,
      totalObjects: originalObjects.length,
      correctPlacements
    };

    setGameMetrics(metrics);
    setIsGameComplete(true);
    onComplete?.(metrics);
  };

  const handleGameSubmit = () => {
    completeGame('memory-recall', gameMetrics);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-purple-100 to-indigo-100">
      <h1 className="text-4xl font-bold mb-4 text-purple-800">Memory Challenge</h1>
      
      {gamePhase === 'start' && (
        <div className="text-center">
          <p className="text-xl mb-4">Get ready to test your memory!</p>
          <button
            onClick={() => setGamePhase('exploration')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Start Game
          </button>
        </div>
      )}

      {gamePhase === 'exploration' && (
        <div className="text-center">
          <div className="mb-4 text-xl">
            Memorize these {originalObjects.length} objects! Time left: {timeLeft}s
          </div>
          <div className="w-96 h-96 border-4 border-purple-300 rounded-lg p-4 bg-white shadow-lg">
            <Grid
              objects={originalObjects}
              isInteractive={false}
              onObjectPlaced={() => {}}
            />
          </div>
        </div>
      )}

      {gamePhase === 'distraction' && (
        <DistractionGame onComplete={handleDistractionComplete} />
      )}

      {gamePhase === 'recall' && (
        <div className="text-center">
          <div className="mb-4 text-xl">
            Place the objects in their original positions
            <div className="text-sm text-purple-600 mt-1">
              {availableObjects.length} objects remaining to place
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-4 p-4 bg-white rounded-lg shadow-md">
              {availableObjects.map((obj) => (
                <DraggableObject
                  key={obj.id}
                  object={obj}
                  onDragStart={() => {}}
                />
              ))}
            </div>
            <div className="w-96 h-96 border-4 border-purple-300 rounded-lg p-4 bg-white shadow-lg">
              <Grid
                objects={placedObjects}
                isInteractive={true}
                onObjectPlaced={handleObjectPlaced}
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className={`
              mt-4 px-6 py-2 rounded-lg transition
              ${availableObjects.length === 0 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-gray-300 cursor-not-allowed text-gray-600'
              }
            `}
            disabled={availableObjects.length > 0}
          >
            {availableObjects.length === 0 ? 'Submit' : `Place ${availableObjects.length} more object${availableObjects.length === 1 ? '' : 's'}`}
          </button>
        </div>
      )}

      <GameSubmission
        isComplete={isGameComplete}
        onSubmit={handleGameSubmit}
        gameMetrics={gameMetrics}
        nextGame={nextGame?.path}
        isLastGame={isLastGame('memory-recall')}
      />
    </div>
  );
}

function renderObjectIcon(geometry: string) {
  switch (geometry) {
    case 'crystal':
      return '💎';
    case 'key':
      return '🗝️';
    case 'dragon':
      return '🐉';
    case 'potion':
      return '🧪';
    case 'compass':
      return '🧭';
    default:
      return '✨';
  }
} 