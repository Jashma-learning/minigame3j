import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ShapeProps } from '../types';
import { Mesh } from 'three';

const RotatingObject: React.FC<ShapeProps> = ({ shape, rotation, speed, isSilhouette = false }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current && !isSilhouette) {
      meshRef.current.rotation.x += delta * speed;
      meshRef.current.rotation.y += delta * speed;
    }
  });

  const renderShape = () => {
    switch (shape.type) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'pyramid':
        return <coneGeometry args={[0.8, 1.5, 4]} />;
      case 'lShape':
        return (
          <group>
            <mesh position={[0.25, 0, 0]}>
              <boxGeometry args={[1.5, 0.5, 0.5]} />
            </mesh>
            <mesh position={[-0.5, 0.5, 0]}>
              <boxGeometry args={[0.5, 1.5, 0.5]} />
            </mesh>
          </group>
        );
      case 'tShape':
        return (
          <group>
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[2, 0.5, 0.5]} />
            </mesh>
            <mesh position={[0, -0.25, 0]}>
              <boxGeometry args={[0.5, 1, 0.5]} />
            </mesh>
          </group>
        );
      case 'cross':
        return (
          <group>
            <mesh>
              <boxGeometry args={[2, 0.5, 0.5]} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[2, 0.5, 0.5]} />
            </mesh>
          </group>
        );
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      rotation={isSilhouette ? rotation : [0, 0, 0]}
    >
      {renderShape()}
      <meshStandardMaterial
        color={isSilhouette ? '#000000' : '#4F46E5'}
        metalness={0.1}
        roughness={0.3}
        transparent={isSilhouette}
        opacity={isSilhouette ? 0.95 : 1}
        emissive={isSilhouette ? '#000000' : '#3730A3'}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

export default RotatingObject; 