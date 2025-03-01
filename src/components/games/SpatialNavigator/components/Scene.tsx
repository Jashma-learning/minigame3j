import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface SceneProps {
  targetRotation: [number, number, number];
  currentRotation: [number, number, number];
  onRotationChange: (rotation: [number, number, number]) => void;
  isInteractive: boolean;
}

export default function Scene({
  targetRotation,
  currentRotation,
  onRotationChange,
  isInteractive
}: SceneProps) {
  const targetMeshRef = useRef<Mesh>(null);
  const playerMeshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (targetMeshRef.current && playerMeshRef.current && isInteractive) {
      // Update rotation values for the player mesh
      const rotation = playerMeshRef.current.rotation;
      onRotationChange([rotation.x, rotation.y, rotation.z]);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />

      {/* Target Object */}
      <mesh
        ref={targetMeshRef}
        position={[-2, 0, 0]}
        rotation={targetRotation}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#4f46e5"
          transparent
          opacity={0.5}
          wireframe
        />
      </mesh>

      {/* Player-controlled Object */}
      <mesh
        ref={playerMeshRef}
        position={[2, 0, 0]}
        rotation={currentRotation}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>

      {/* Reference Grid */}
      <gridHelper args={[10, 10, '#9ca3af', '#9ca3af']} />
    </>
  );
} 