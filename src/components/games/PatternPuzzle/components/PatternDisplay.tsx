import React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

interface PatternDisplayProps {
  pattern: number[][];
}

export default function PatternDisplay({ pattern }: PatternDisplayProps) {
  // Early return if pattern is invalid
  if (!pattern || !pattern.length || !pattern[0]) {
    return null;
  }

  const size = pattern.length;
  const spacing = 1.2;
  const offset = (size * spacing) / 2;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <group position={[-offset, 0, -offset]}>
        {pattern.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <mesh
              key={`${rowIndex}-${colIndex}`}
              position={[rowIndex * spacing, 0, colIndex * spacing]}
            >
              <boxGeometry args={[1, 0.1, 1]} />
              <meshStandardMaterial
                color={cell ? '#8b5cf6' : '#1e1b4b'}
                metalness={0.5}
                roughness={0.5}
                emissive={cell ? '#8b5cf6' : '#000000'}
                emissiveIntensity={cell ? 0.5 : 0}
              />
            </mesh>
          ))
        )}
      </group>
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 3}
      />
    </>
  );
} 