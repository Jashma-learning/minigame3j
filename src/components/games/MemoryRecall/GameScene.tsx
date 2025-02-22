'use client';

import { useState, useRef, useEffect } from 'react';
import { GameObject, GamePhase } from '@/types/game';
import { generateRandomObjects } from '@/utils/gameUtils';
import DraggableObject from './DraggableObject';

const GRID_SIZE = 5; // 5x5 grid
const CELL_SIZE = 2; // Size of each cell

interface GameSceneProps {
  gamePhase: GamePhase;
  onObjectsGenerated?: (objects: GameObject[]) => void;
  onObjectPlaced?: (object: GameObject) => void;
}

export default function GameScene({ gamePhase, onObjectsGenerated, onObjectPlaced }: GameSceneProps) {
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [glowEffect, setGlowEffect] = useState(false);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (gamePhase === 'exploration') {
      const gridPositions: [number, number][] = [
        [-CELL_SIZE, -CELL_SIZE], [0, -CELL_SIZE], [CELL_SIZE, -CELL_SIZE],
        [-CELL_SIZE, 0], [0, 0], [CELL_SIZE, 0],
        [-CELL_SIZE, CELL_SIZE], [0, CELL_SIZE], [CELL_SIZE, CELL_SIZE]
      ];
      
      const initialObjects = generateRandomObjects(5, gridPositions);
      setObjects(initialObjects);
      if (onObjectsGenerated) {
        onObjectsGenerated(initialObjects);
      }

      // Add magical glow effect
      const glowInterval = setInterval(() => {
        setGlowEffect(prev => !prev);
      }, 1000);

      return () => clearInterval(glowInterval);
    } else if (gamePhase === 'recall') {
      setObjects([]);
    }
  }, [gamePhase, onObjectsGenerated]);

  const handleObjectPlaced = (objectId: string, position: [number, number]) => {
    const placedObject = objects.find(obj => obj.id === objectId);
    if (placedObject && onObjectPlaced) {
      onObjectPlaced({
        ...placedObject,
        position,
        glow: true
      });
    }
  };

  return (
    <group ref={sceneRef}>
      {/* Ground plane with magical effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[GRID_SIZE * CELL_SIZE + 2, GRID_SIZE * CELL_SIZE + 2]} />
        <meshStandardMaterial 
          color="#4a148c"
          metalness={0.3}
          roughness={0.7}
          emissive="#6a1b9a"
          emissiveIntensity={glowEffect ? 0.5 : 0.2}
        />
      </mesh>

      {/* Game objects */}
      {objects.map(object => (
        <DraggableObject
          key={object.id}
          object={object}
          isInteractive={gamePhase === 'recall'}
          onPlaced={handleObjectPlaced}
          initialPosition={object.position}
        />
      ))}

      {/* Magical lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.8} castShadow />
      {glowEffect && (
        <pointLight
          position={[0, 3, 0]}
          intensity={1.5}
          color="#9c27b0"
          distance={10}
          decay={2}
        />
      )}
    </group>
  );
} 