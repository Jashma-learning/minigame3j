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
import { BaseMetric } from '../../../types/cognitiveMetrics';

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

  const handleDistractionComplete = (scoreMetric: BaseMetric) => {
    setDistractionScore(scoreMetric.value);
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

    const metrics = {
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

    // Automatically submit cognitive metrics
    completeGame('memory-recall', {
      Memory_Recall_Accuracy: { value: metrics.accuracy, timestamp: Date.now() },
      Short_Term_Memory_Retention: { value: metrics.correctPlacements / metrics.totalObjects * 100, timestamp: Date.now() },
      Working_Memory_Span: { value: metrics.totalObjects, timestamp: Date.now() },
      Memory_Decay_Rate: { value: metrics.hesitationTime / 1000, timestamp: Date.now() },
      Verbal_Working_Memory_Score: { value: metrics.distractionScore, timestamp: Date.now() }
    });
  };

  const handleGameSubmit = () => {}; // Empty function since submission is handled in handleSubmit

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-purple-100 to-indigo-100 py-2 px-2">
      <div className="w-full max-w-xl mx-auto flex flex-col items-center">
        <h1 className="text-xl font-bold mb-1 text-purple-800">Memory Recall</h1>
        <p className="text-xs text-gray-600 mb-2">Remember and recreate object positions</p>
        
        {gamePhase === 'start' && (
          <div className="text-center w-full max-w-sm bg-white p-3 rounded-lg shadow-md">
            <p className="text-sm mb-2">Get ready to test your memory!</p>
            <button
              onClick={() => setGamePhase('exploration')}
              className="bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition text-sm"
            >
              Start Game
            </button>
          </div>
        )}

        {gamePhase === 'exploration' && (
          <div className="text-center w-full">
            <div className="mb-1">
              <span className="text-sm font-medium">Memorize these {originalObjects.length} objects!</span>
              <div className="text-purple-600 font-bold text-base mt-0.5">Time left: {timeLeft}s</div>
            </div>
            <div className="w-full max-w-[280px] mx-auto aspect-square border border-purple-300 rounded-lg p-1.5 bg-white shadow-lg">
              <Grid
                objects={originalObjects}
                isInteractive={false}
                onObjectPlaced={() => {}}
              />
            </div>
          </div>
        )}

        {gamePhase === 'distraction' && (
          <div className="w-full max-w-[280px]">
            <DistractionGame onComplete={handleDistractionComplete} />
          </div>
        )}

        {gamePhase === 'recall' && (
          <div className="text-center w-full">
            <div className="mb-1">
              <h2 className="text-sm font-medium mb-0.5">Place the objects in their original positions</h2>
              <div className="text-purple-600 text-xs">
                {availableObjects.length} objects remaining to place
              </div>
            </div>
            
            <div className="flex flex-col gap-2 items-center">
              <div className="w-full max-w-[280px] bg-white rounded-lg shadow-md p-1.5 min-h-[50px] flex items-center justify-center">
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {availableObjects.map((obj) => (
                    <DraggableObject
                      key={obj.id}
                      object={obj}
                      onDragStart={() => {}}
                    />
                  ))}
                </div>
              </div>
              
              <div className="w-full max-w-[280px] aspect-square border border-purple-300 rounded-lg p-1.5 bg-white shadow-lg">
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
                mt-2 px-3 py-1 rounded-lg transition text-xs font-medium
                ${availableObjects.length === 0 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
          currentGameId="memory-recall"
        />
      </div>
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