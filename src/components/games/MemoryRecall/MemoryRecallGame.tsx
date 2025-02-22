import { useState, useEffect } from 'react';
import Grid from './Grid';
import DistractionGame from './DistractionGame';
import { generateRandomObjects, generateGridPositions } from '@/utils/gameUtils';
import { GamePhase, GameObject, GameMetrics } from '@/types/game';
import CognitiveMetricsCharts from './CognitiveMetricsCharts';
import { calculateCognitiveIndices, calculateDifficultyParameters, checkLevelAdvancement } from '@/utils/cognitiveMetrics';

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
  const [level, setLevel] = useState(1);
  const [previousScores, setPreviousScores] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [firstMoveTime, setFirstMoveTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [cognitiveIndices, setCognitiveIndices] = useState<any>(null);

  const initializeGame = () => {
    const { gridSize, objectCount, memorizationTime } = calculateDifficultyParameters(level);
    const positions = generateGridPositions(gridSize);
    const objects = generateRandomObjects(objectCount, positions);
    
    setOriginalObjects(objects);
    setTimeLeft(memorizationTime);
    setGamePhase('exploration');
    setAttempts(prev => prev + 1);
  };

  useEffect(() => {
    if (gamePhase === 'start') {
      initializeGame();
    }
  }, [gamePhase, level]);

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
    const accuracy = (placedObjects.filter(obj => {
      const original = originalObjects.find(o => o.id === obj.id);
      return original?.position[0] === obj.position[0] && 
             original?.position[1] === obj.position[1];
    }).length / originalObjects.length) * 100;

    const currentMetrics: GameMetrics = {
      explorationTime: timeLeft,
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
    };

    setMetrics(currentMetrics);

    // Calculate cognitive indices
    const indices = calculateCognitiveIndices(
      currentMetrics,
      originalObjects,
      calculateDifficultyParameters(level).gridSize
    );
    setCognitiveIndices(indices);

    // Update previous scores and check for level advancement
    const newScores = [...previousScores, indices.ocps].slice(-5);
    setPreviousScores(newScores);

    if (checkLevelAdvancement(indices, attempts, newScores)) {
      setLevel(prev => prev + 1);
      setAttempts(0);
      setPreviousScores([]);
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
        <div className="text-center max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-purple-800">Cognitive Assessment Results</h2>
          
          {/* Level and Progress Information */}
          <div className="mb-6">
            <div className="text-xl font-semibold text-purple-600">
              Level {level} - Attempt {attempts}/3
            </div>
            <div className="text-sm text-gray-600">
              {attempts < 3 ? `${3 - attempts} more attempts needed before possible advancement` : 
               cognitiveIndices?.ocps >= 75 ? 'Ready for next level!' : 'Keep practicing to advance'}
            </div>
          </div>

          {/* Cognitive Indices Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              {cognitiveIndices && (
                <>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <h3 className="text-xl font-semibold text-purple-800 mb-2">Spatial Memory Index</h3>
                    <div className="text-lg mb-1">{Math.round(cognitiveIndices.smi)}%</div>
                    <div className="text-sm text-gray-600">Threshold: 75%</div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">Processing Speed Index</h3>
                    <div className="text-lg mb-1">{Math.round(cognitiveIndices.psi)}%</div>
                    <div className="text-sm text-gray-600">Threshold: 70%</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-xl">
                    <h3 className="text-xl font-semibold text-green-800 mb-2">Attention Span Index</h3>
                    <div className="text-lg mb-1">{Math.round(cognitiveIndices.asi)}%</div>
                    <div className="text-sm text-gray-600">Threshold: 80%</div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-xl">
                    <h3 className="text-xl font-semibold text-yellow-800 mb-2">Distraction Resistance</h3>
                    <div className="text-lg mb-1">{Math.round(cognitiveIndices.dri)}%</div>
                    <div className="text-sm text-gray-600">Threshold: 65%</div>
                  </div>

                  <div className="bg-pink-50 p-4 rounded-xl">
                    <h3 className="text-xl font-semibold text-pink-800 mb-2">Sequential Memory Index</h3>
                    <div className="text-lg mb-1">{Math.round(cognitiveIndices.seqi)}%</div>
                    <div className="text-sm text-gray-600">Threshold: 70%</div>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-xl">
                    <h3 className="text-xl font-semibold text-indigo-800 mb-2">Overall Performance</h3>
                    <div className="text-lg mb-1">{Math.round(cognitiveIndices.ocps)}%</div>
                    <div className="text-sm text-gray-600">Threshold: 75%</div>
                  </div>
                </>
              )}
            </div>

            {/* Charts */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <CognitiveMetricsCharts metrics={metrics} cognitiveIndices={cognitiveIndices} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setGamePhase('start');
                setPlacedObjects([]);
                setAvailableObjects([]);
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
            <button
              onClick={() => {
                // TODO: Add functionality to save or share results
                alert('Results saved!');
              }}
              className="bg-gray-100 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Save Results
            </button>
          </div>
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