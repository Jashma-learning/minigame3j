'use client';

import React, { useRef } from 'react';
import { Position3D } from '@/types/maze';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface CollectibleItemProps {
  position: Position3D;
  isActive?: boolean;
}

export default function CollectibleItem({ position, isActive = false }: CollectibleItemProps) {
  const meshRef = useRef<Mesh>(null);
  const rotationRef = useRef(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      rotationRef.current += delta;
      meshRef.current.rotation.y = rotationRef.current;
      meshRef.current.position.y = position.y + Math.sin(rotationRef.current * 2) * 0.1;
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Glow effect */}
      <pointLight
        position={[0, 0.5, 0]}
        intensity={isActive ? 1 : 0.5}
        distance={2}
        color="#ffd700"
      />

      {/* Item mesh */}
      <mesh ref={meshRef} castShadow>
        <octahedronGeometry args={[0.3]} />
        <meshStandardMaterial
          color="#ffd700"
          metalness={0.9}
          roughness={0.1}
          emissive="#ffd700"
          emissiveIntensity={isActive ? 0.8 : 0.4}
        />
      </mesh>

      {/* Particle effect */}
      <points>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[new Float32Array(60).map(() => (Math.random() - 0.5) * 0.5), 3]}
            count={20}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#ffd700"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </group>
  );
} 