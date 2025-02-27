'use client';

import React from 'react';
import { Position3D } from '@/types/maze';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh, MeshStandardMaterial } from 'three';

interface MazeCeilingProps {
  position: Position3D;
}

export default function MazeCeiling({ position }: MazeCeilingProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state) => {
    if (meshRef.current) {
      timeRef.current += 0.01;
      const material = meshRef.current.material as MeshStandardMaterial;
      material.emissiveIntensity = Math.sin(timeRef.current) * 0.1 + 0.2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      receiveShadow
    >
      <boxGeometry args={[50, 0.1, 50]} />
      <meshStandardMaterial
        color="#1a202c"
        metalness={0.8}
        roughness={0.2}
        emissive="#4a5568"
        emissiveIntensity={0.2}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
} 