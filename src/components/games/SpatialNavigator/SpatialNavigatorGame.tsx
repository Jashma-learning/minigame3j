import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import RotatingObject from './components/RotatingObject';
import SilhouetteOptions from './components/SilhouetteOptions';
import { generateRandomRotation, calculateScore } from './utils/gameUtils';
import { ShapeConfig } from './types';

interface SpatialNavigatorGameProps {
  onComplete: (score: number) => void;
}

const SHAPES: ShapeConfig[] = [
  { type: 'cube', difficulty: 1 },
  { type: 'pyramid', difficulty: 2 },
  { type: 'lShape', difficulty: 3 },
  { type: 'tShape', difficulty: 4 },
  { type: 'cross', difficulty: 5 }
];

const SpatialNavigatorGame: React.FC<SpatialNavigatorGameProps> = ({ onComplete }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentShape, setCurrentShape] = useState<ShapeConfig>(SHAPES[0]);
  const [rotation, setRotation] = useState(() => generateRandomRotation());
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const rotationSpeed = useRef(0.5 + (currentLevel * 0.1));
  const timeStarted = useRef(Date.now());

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    setAttempts(0);
    setCurrentLevel(1);
    setCurrentShape(SHAPES[0]);
    setRotation(generateRandomRotation());
    timeStarted.current = Date.now();
  }, []);

  const handleSilhouetteSelect = useCallback((selectedRotation: [number, number, number]) => {
    const isCorrect = rotation.every((value, index) => 
      Math.abs(value - selectedRotation[index]) < 0.1
    );

    setShowFeedback(isCorrect ? 'correct' : 'wrong');
    setAttempts(prev => prev + 1);

    if (isCorrect) {
      const timeTaken = (Date.now() - timeStarted.current) / 1000;
      const levelScore = calculateScore(currentLevel, timeTaken, attempts);
      setScore(prev => prev + levelScore);

      // Progress to next level
      setTimeout(() => {
        if (currentLevel >= SHAPES.length) {
          onComplete(score + levelScore);
        } else {
          setCurrentLevel(prev => prev + 1);
          setCurrentShape(SHAPES[currentLevel]);
          setRotation(generateRandomRotation());
          rotationSpeed.current = 0.5 + (currentLevel * 0.1);
          timeStarted.current = Date.now();
        }
        setShowFeedback(null);
      }, 1500);
    } else {
      setTimeout(() => {
        setShowFeedback(null);
      }, 1000);
    }
  }, [currentLevel, rotation, attempts, score, onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-start py-4 px-6">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2 text-white">Spatial Navigator</h1>
        <div className="flex gap-4 justify-center">
          <div className="px-4 py-2 bg-purple-700 rounded-lg">
            Level: {currentLevel}
          </div>
          <div className="px-4 py-2 bg-purple-700 rounded-lg">
            Score: {score}
          </div>
          <div className="px-4 py-2 bg-purple-700 rounded-lg">
            Attempts: {attempts}
          </div>
        </div>
      </div>

      {!gameStarted ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <button
            onClick={startGame}
            className="px-6 py-3 bg-green-500 text-white rounded-lg text-xl hover:bg-green-600 transition-colors"
          >
            Start Game
          </button>
          <p className="mt-4 text-gray-300 text-center max-w-md">
            Test your spatial reasoning skills! Match the rotating shape to its correct orientation.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
          <div className="relative w-full" style={{ height: '40vh', minHeight: '300px' }}>
            <div className="absolute inset-0 bg-gray-800 rounded-xl overflow-hidden">
              <Canvas camera={{ position: [0, 2, 5] }}>
                <ambientLight intensity={0.7} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <RotatingObject
                  shape={currentShape}
                  rotation={rotation}
                  speed={rotationSpeed.current}
                />
                <OrbitControls 
                  enableZoom={false}
                  enablePan={false}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={Math.PI / 2}
                />
              </Canvas>

              {showFeedback && (
                <div className={`absolute inset-0 flex items-center justify-center bg-opacity-50 ${
                  showFeedback === 'correct' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  <span className="text-6xl text-white">
                    {showFeedback === 'correct' ? '✓' : '✗'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full">
            <SilhouetteOptions
              shape={currentShape}
              onSelect={handleSilhouetteSelect}
              disabled={showFeedback !== null}
            />
          </div>

          <div className="text-center text-gray-300 mt-2">
            <p>Match the rotating shape to its correct silhouette!</p>
            <p className="text-sm mt-1">Tip: Pay attention to the orientation of the shape.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpatialNavigatorGame; 