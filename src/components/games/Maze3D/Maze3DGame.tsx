'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls } from '@react-three/drei';
import MazeEnvironment from './components/MazeEnvironment';
import Player from './Player';
import { Position3D, MazeLevel, Wall } from './types';
import { generateMazeLevel } from './utils/mazeGenerator';
import * as THREE from 'three';

interface Maze3DGameProps {
  width?: number;
  height?: number;
  debug?: boolean;
  onComplete?: (score: number) => void;
}

export default function Maze3DGame({ width = 15, height = 15, debug = false, onComplete }: Maze3DGameProps) {
  const [mazeLevel, setMazeLevel] = useState<MazeLevel | null>(null);
  const [playerPosition, setPlayerPosition] = useState<Position3D>({ x: 1, y: 0, z: 1 });
  const [walls, setWalls] = useState<Wall[]>([]);
  const [score, setScore] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);
  const [gameTime, setGameTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  // Initialize game
  useEffect(() => {
    const level = generateMazeLevel(1);
    setMazeLevel(level);
    
    if (level.start) {
      setPlayerPosition({
        x: level.start.x * 2,
        y: 0,
        z: level.start.z * 2
      });
    }

    const wallColliders: Wall[] = level.cells
      .filter(cell => cell.type === 'wall')
      .map(cell => ({
        position: {
          x: cell.position.x * 2,
          y: 1,
          z: cell.position.z * 2
        },
        scale: [2, 2, 2] as [number, number, number]
      }));
    setWalls(wallColliders);

    // Start timer
    timerRef.current = setInterval(() => {
      if (!isPaused && isGameActive) {
        setGameTime(prev => prev + 1);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle game completion
  const handleGameComplete = () => {
    setIsGameActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (onComplete) {
      // Include time bonus in score calculation
      const timeBonus = Math.max(0, 1000 - gameTime * 10); // Decrease bonus as time increases
      const finalScore = score + timeBonus;
      onComplete(finalScore);
    }
  };

  // Check for win condition
  useEffect(() => {
    if (!mazeLevel || !isGameActive) return;

    const endPosition = {
      x: mazeLevel.end.x * 2,
      z: mazeLevel.end.z * 2
    };

    const distanceToEnd = Math.sqrt(
      Math.pow(playerPosition.x - endPosition.x, 2) +
      Math.pow(playerPosition.z - endPosition.z, 2)
    );

    if (distanceToEnd < 1) {
      handleGameComplete();
    }
  }, [playerPosition, mazeLevel, isGameActive, score]);

  const handlePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleRestart = () => {
    window.location.reload();
  };

  if (!mazeLevel) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        ref={canvasRef}
        shadows
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [playerPosition.x, 1.7, playerPosition.z]
        }}
        onCreated={({ gl, camera }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.setPixelRatio(window.devicePixelRatio);
          camera.rotation.order = 'YXZ';
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[50, 50, 0]}
          intensity={0.7}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        >
          <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50, 0.1, 200]} />
        </directionalLight>
        <hemisphereLight intensity={0.4} groundColor="#2d5a27" />

        {/* Environment */}
        <group position={[0, 0, 0]}>
          {mazeLevel && (
            <MazeEnvironment
              cells={mazeLevel.cells}
              collectibles={mazeLevel.collectibles}
              onCollectItem={(id) => {
                setScore(prev => prev + 100);
              }}
            />
          )}
        </group>

        {/* Player */}
        <Player
          position={playerPosition}
          rotation={0}
          onMove={setPlayerPosition}
          isActive={isGameActive && !isPaused}
          walls={walls}
          domElement={canvasRef.current}
        />

        {debug && <OrbitControls />}
        {debug && <Stats />}
        <fog attach="fog" args={['#2d5a27', 15, 40]} />
      </Canvas>

      {/* Game UI */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-4 bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm">
        <div className="text-xl">Score: {score}</div>
        <div className="text-xl">Time: {formatTime(gameTime)}</div>
      </div>

      {/* Initial Click Prompt */}
      {!isPaused && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center bg-black bg-opacity-70 p-6 rounded-lg backdrop-blur-sm">
          <p className="text-3xl mb-4">Click to Start</p>
          <p className="text-lg opacity-75">WASD to move | SHIFT to run | SPACE to jump</p>
          <p className="text-lg opacity-75 mt-2">ESC to pause</p>
        </div>
      )}

      {/* Minimap */}
      <div className="absolute top-4 right-4 w-48 h-48 bg-black bg-opacity-70 rounded-lg p-2 backdrop-blur-sm">
        <div className="w-full h-full relative border-2 border-white/30 rounded">
          {mazeLevel.cells.map((cell, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${
                cell.type === 'wall' ? 'bg-gray-500' :
                cell.type === 'start' ? 'bg-green-500' :
                cell.type === 'end' ? 'bg-red-500' :
                'bg-black bg-opacity-20'
              }`}
              style={{
                left: `${(cell.position.x / width) * 100}%`,
                top: `${(cell.position.z / height) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
          <div
            className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg"
            style={{
              left: `${(playerPosition.x / (width * 2)) * 100}%`,
              top: `${(playerPosition.z / (height * 2)) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      </div>

      {/* Game Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm">
        <div className="flex gap-4 items-center">
          <button
            onClick={handlePause}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={handleRestart}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Restart
          </button>
        </div>
      </div>

      {/* Pause Menu */}
      {isPaused && (
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-xl text-white text-center">
            <h2 className="text-3xl font-bold mb-6">Game Paused</h2>
            <div className="space-y-4">
              <button
                onClick={handlePause}
                className="w-full px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Resume
              </button>
              <button
                onClick={handleRestart}
                className="w-full px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {!isGameActive && (
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-xl text-white text-center">
            <h2 className="text-3xl font-bold mb-6">Level Complete!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-xl">Time: {formatTime(gameTime)}</p>
              <p className="text-xl">Final Score: {score}</p>
            </div>
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 