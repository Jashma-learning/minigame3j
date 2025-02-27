'use client';

import React from 'react';
import { Position3D } from '@/types/maze';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';

interface MazeWallProps {
  position: Position3D;
  isActive?: boolean;
}

export default function MazeWall({ position, isActive = false }: MazeWallProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial
        color={isActive ? '#4a9eff' : '#2d3748'}
        metalness={0.5}
        roughness={0.5}
        emissive={isActive ? '#4a9eff' : '#000000'}
        emissiveIntensity={isActive ? 0.5 : 0}
      />
    </mesh>
  );
} 