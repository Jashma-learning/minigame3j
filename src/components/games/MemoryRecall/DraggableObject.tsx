'use client';

import { useRef, useState } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { Mesh } from 'three';
import { useDrag } from '@use-gesture/react';
import { GameObject } from '@/types/game';

interface DraggableObjectProps {
  object: GameObject;
  isInteractive: boolean;
  onPlaced?: (objectId: string, position: [number, number]) => void;
  initialPosition: [number, number];
}

export default function DraggableObject({ 
  object, 
  isInteractive, 
  onPlaced,
  initialPosition,
}: DraggableObjectProps) {
  const meshRef = useRef<Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { size, viewport } = useThree();
  const [position, setPosition] = useState<[number, number]>(initialPosition);
  const [hover, setHover] = useState(false);

  const bind = useDrag(
    ({ active, movement: [x, y], last }) => {
      if (isInteractive) {
        setIsDragging(active);

        const aspect = size.width / viewport.width;
        const moveX = x / aspect;
        const moveY = y / aspect;

        const newPosition: [number, number] = [
          initialPosition[0] + moveX * 0.01,
          initialPosition[1] + moveY * 0.01,
        ];

        setPosition(newPosition);

        if (last && onPlaced) {
          onPlaced(object.id, newPosition);
        }
      }
    },
    { enabled: isInteractive }
  );

  const renderGeometry = () => {
    switch (object.geometry) {
      case 'crystal':
        return (
          <>
            <octahedronGeometry args={[0.3]} />
            <meshStandardMaterial
              color={object.color}
              metalness={0.9}
              roughness={0.1}
              emissive={object.color}
              emissiveIntensity={hover || isDragging ? 0.5 : 0.2}
              transparent
              opacity={isDragging ? 0.7 : 1}
            />
          </>
        );
      case 'key':
        return (
          <>
            <cylinderGeometry args={[0.1, 0.1, 0.4]} />
            <meshStandardMaterial
              color={object.color}
              metalness={0.8}
              roughness={0.2}
              emissive={object.color}
              emissiveIntensity={hover || isDragging ? 0.5 : 0.2}
              transparent
              opacity={isDragging ? 0.7 : 1}
            />
          </>
        );
      case 'dragon':
        return (
          <>
            <torusKnotGeometry args={[0.2, 0.1]} />
            <meshStandardMaterial
              color={object.color}
              metalness={0.7}
              roughness={0.3}
              emissive={object.color}
              emissiveIntensity={hover || isDragging ? 0.5 : 0.2}
              transparent
              opacity={isDragging ? 0.7 : 1}
            />
          </>
        );
      case 'potion':
        return (
          <>
            <sphereGeometry args={[0.25]} />
            <meshStandardMaterial
              color={object.color}
              metalness={0.3}
              roughness={0.7}
              emissive={object.color}
              emissiveIntensity={hover || isDragging ? 0.5 : 0.2}
              transparent
              opacity={isDragging ? 0.7 : 1}
            />
          </>
        );
      default:
        return (
          <>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial
              color={object.color}
              metalness={0.5}
              roughness={0.5}
              emissive={object.color}
              emissiveIntensity={hover || isDragging ? 0.5 : 0.2}
              transparent
              opacity={isDragging ? 0.7 : 1}
            />
          </>
        );
    }
  };

  return (
    <group position={[position[0], 0.5, position[1]]}>
      {/* Magical glow effect */}
      {(hover || isDragging || object.glow) && (
        <pointLight
          position={[0, 0.5, 0]}
          intensity={0.5}
          color={object.color}
          distance={2}
          decay={2}
        />
      )}

      {/* Shadow */}
      <mesh
        position={[0, -0.49, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial
          color={isDragging ? "#4CAF50" : "#000000"}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Object */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          if (isInteractive) {
            e.stopPropagation();
          }
        }}
        {...(bind() as any)}
      >
        {renderGeometry()}
      </mesh>
    </group>
  );
} 