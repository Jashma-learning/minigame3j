'use client';

import React from 'react';
import { Position3D } from '@/types/maze';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh, MeshStandardMaterial } from 'three';

interface MazeFloorProps {
  position: Position3D;
  isVisited?: boolean;
}

export default function MazeFloor({ position, isVisited = false }: MazeFloorProps) {
  const meshRef = useRef<Mesh>(null);
  const pulseRef = useRef(0);

  useFrame(() => {
    if (meshRef.current && isVisited) {
      pulseRef.current += 0.05;
      const intensity = Math.sin(pulseRef.current) * 0.2 + 0.3;
      (meshRef.current.material as MeshStandardMaterial).emissiveIntensity = intensity;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y - 0.5, position.z]}
      receiveShadow
    >
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial
        color={isVisited ? '#9f7aea' : '#718096'}
        metalness={0.2}
        roughness={0.8}
        emissive={isVisited ? '#9f7aea' : '#000000'}
        emissiveIntensity={isVisited ? 0.3 : 0}
      />
    </mesh>
  );
} 