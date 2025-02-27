'use client';

import React, { useRef, useState } from 'react';
import { Position3D, PuzzleType } from '@/types/maze';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, MeshStandardMaterial } from 'three';

interface PuzzleGateProps {
  position: Position3D;
  isActive?: boolean;
  puzzleType?: PuzzleType;
}

export default function PuzzleGate({ position, isActive = false, puzzleType = 'pattern' }: PuzzleGateProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const pulseRef = useRef(0);
  const targetScale = useRef(new Vector3(1, 1, 1));

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Pulse effect
      pulseRef.current += delta;
      const pulseIntensity = Math.sin(pulseRef.current * 2) * 0.1 + 0.9;

      // Scale animation
      const scale = meshRef.current.scale;
      const target = hovered ? 1.1 : 1;
      targetScale.current.setScalar(target * pulseIntensity);
      scale.lerp(targetScale.current, 0.1);

      // Rotation for active state
      if (isActive) {
        meshRef.current.rotation.y += delta * 0.5;
      }

      // Update material
      const material = meshRef.current.material as MeshStandardMaterial;
      material.emissiveIntensity = isActive ? 0.8 : (hovered ? 0.5 : 0.3);
    }
  });

  const getPuzzleColor = () => {
    switch (puzzleType) {
      case 'pattern':
        return '#3182ce'; // Blue
      case 'sequence':
        return '#805ad5'; // Purple
      case 'logic':
        return '#38a169'; // Green
      case 'timing':
        return '#d69e2e'; // Yellow
      default:
        return '#4a5568'; // Gray
    }
  };

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Gate frame */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.2, 2.2, 0.2]} />
        <meshStandardMaterial
          color={getPuzzleColor()}
          metalness={0.8}
          roughness={0.2}
          emissive={getPuzzleColor()}
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Gate effect */}
      {isActive && (
        <>
          <pointLight
            position={[0, 0, 0]}
            intensity={1}
            distance={3}
            color={getPuzzleColor()}
          />
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1, 2]} />
            <meshBasicMaterial
              color={getPuzzleColor()}
              transparent
              opacity={0.2}
              side={2}
            />
          </mesh>
        </>
      )}

      {/* Puzzle type indicator */}
      <mesh position={[0, 0.8, 0.15]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshBasicMaterial
          color={getPuzzleColor()}
          transparent
          opacity={0.8}
          side={2}
        />
      </mesh>
    </group>
  );
} 