import { useState, useEffect } from 'react';
import Grid from './Grid';
import DistractionGame from './DistractionGame';
import { generateRandomObjects, generateGridPositions } from '@/utils/gameUtils';
import { GamePhase, GameObject, GameMetrics } from '@/types/game';

export default function MemoryRecallGame() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('start');
  const [timeLeft, setTimeLeft] = useState(5);
  const [originalObjects, setOriginalObjects] = useState<GameObject[]>([]);
  const [placedObjects, setPlacedObjects] = useState<GameObject[]>([]);
  const [availableObjects, setAvailableObjects] = useState<GameObject[]>([]);
  const [distractionScore, setDistractionScore] = useState(0);
  const [metrics, setMetrics] = useState<GameMetrics>({
    explorationTime: 0,
    recallTime: 0,
    accuracy: 0,
    distractionScore: 0,
    objectPlacements: [],
    hesitationTime: 0
  });
  const [objectCount, setObjectCount] = useState(5);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [firstMoveTime, setFirstMoveTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(0);

  const initializeGame = () => {
    const gridSize = 5;
    const positions = generateGridPositions(gridSize);
    
    // Always generate exactly 3 objects
    const objects = generateRandomObjects(3, positions);
    
    // Verify we have exactly 3 objects before setting state
    if (objects.length === 3) {
      setOriginalObjects(objects);
      setTimeLeft(5);
      setGamePhase('exploration');
    } else {
      // If somehow we don't have 3 objects, try again
      initializeGame();
    }
  };

  useEffect(() => {
    if (gamePhase === 'start') {
      initializeGame();
    }
  }, [gamePhase, objectCount]);

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
      // Simply place the object and remove it from available objects
      setAvailableObjects(prev => prev.filter(obj => obj.id !== objectId));
      setPlacedObjects(prev => [...prev, { ...placedObject, position }]);
    }
  };

  const handleSubmit = () => {
    // Calculate accuracy only when submitting
    const accuracy = (placedObjects.filter(obj => {
      const original = originalObjects.find(o => o.id === obj.id);
      return original?.position[0] === obj.position[0] && 
             original?.position[1] === obj.position[1];
    }).length / originalObjects.length) * 100;

    setMetrics({
      explorationTime: 5,
      recallTime: Date.now() - startTime,
      accuracy,
      distractionScore,
      hesitationTime: firstMoveTime || 0,
      objectPlacements: placedObjects.map(obj => ({
        objectId: obj.id,
        originalPosition: originalObjects.find(o => o.id === obj.id)?.position || [0, 0],
        placedPosition: obj.position,
        timeTaken: Date.now() - startTime,
        isCorrect: originalObjects.find(o => o.id === obj.id)?.position === obj.position
      }))
    });

    if (accuracy > 80) {
      setObjectCount(prev => Math.min(prev + 1, 8));
    }

    setGamePhase('result');
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
                <div
                  key={obj.id}
                  className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg cursor-grab active:cursor-grabbing hover:bg-purple-200 transition-colors"
                  draggable="true"
                  onDragStart={(e) => {
                    e.currentTarget.classList.add('opacity-50');
                    e.dataTransfer.setData('text', obj.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.classList.remove('opacity-50');
                  }}
                >
                  {renderObjectIcon(obj.geometry)}
                </div>
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

      {gamePhase === 'result' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Complete!</h2>
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star, index) => (
              <span key={star} className="text-4xl">
                {index < Math.floor(metrics.accuracy / 20) ? '⭐' : '☆'}
              </span>
            ))}
          </div>
          <p className="text-xl mb-2">
            Great job! You restored {placedObjects.length}/{originalObjects.length} objects!
          </p>
          <p className="text-xl mb-2">Accuracy: {Math.round(metrics.accuracy)}%</p>
          <p className="text-xl mb-4">Distraction Score: {distractionScore}</p>
          {metrics.accuracy < 100 && (
            <p className="text-lg mb-4 text-purple-600">Try again for perfection!</p>
          )}
          <button
            onClick={() => {
              setGamePhase('start');
              setPlacedObjects([]);
              setAvailableObjects([]);
              setAttempts({});
              setFirstMoveTime(null);
              setMetrics({
                explorationTime: 0,
                recallTime: 0,
                accuracy: 0,
                distractionScore: 0,
                objectPlacements: [],
                hesitationTime: 0
              });
            }}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Play Again
          </button>
        </div>
      )}
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