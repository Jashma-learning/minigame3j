import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars, Cloud, useHelper } from '@react-three/drei';
import * as THREE from 'three';
import { Position3D, MazeCell } from '../types';

interface MazeEnvironmentProps {
  cells: MazeCell[];
  collectibles: MazeCell[];
  onCollectItem: (position: Position3D) => void;
}

export default function MazeEnvironment({
  cells,
  collectibles,
  onCollectItem
}: MazeEnvironmentProps) {
  // Create refs for lights to use with helpers
  const mainLightRef = React.useRef<THREE.DirectionalLight>(null);
  const fillLightRef = React.useRef<THREE.DirectionalLight>(null);

  // Add light helpers in development
  if (process.env.NODE_ENV === 'development') {
    useHelper(mainLightRef, THREE.DirectionalLightHelper, 1);
    useHelper(fillLightRef, THREE.DirectionalLightHelper, 1);
  }

  return (
    <>
      {/* Environment */}
      <color attach="background" args={['#000720']} />
      <fog attach="fog" args={['#000720', 5, 30]} />
      
      <Sky 
        distance={450000} 
        sunPosition={[0, 1, 0]} 
        inclination={0.6}
        azimuth={0.25}
        mieCoefficient={0.001}
        mieDirectionalG={0.99}
        rayleigh={0.2}
        turbidity={3}
      />

      {/* Main lighting setup */}
      <ambientLight intensity={0.8} color="#ffffff" />
      
      <directionalLight
        ref={mainLightRef}
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        color="#ffffff"
      />

      <directionalLight
        ref={fillLightRef}
        position={[-10, 15, -10]}
        intensity={1}
        castShadow
        color="#b794f4"
      />

      {/* Ground */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshPhysicalMaterial 
          color="#2a2a4a"
          metalness={0.1}
          roughness={0.7}
          envMapIntensity={0.8}
          clearcoat={0.1}
          clearcoatRoughness={0.2}
          reflectivity={0.3}
        />
      </mesh>

      {/* Maze Walls */}
      {cells.map((cell, index) => {
        if (cell.type === 'wall') {
          return (
            <group key={index}>
              {/* Main wall */}
              <mesh
                position={[cell.position.x, cell.position.y + 1, cell.position.z]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[1, 2, 1]} />
                <meshPhysicalMaterial
                  color="#3a3a6a"
                  metalness={0.2}
                  roughness={0.8}
                  clearcoat={0.1}
                  clearcoatRoughness={0.2}
                  reflectivity={0.5}
                  envMapIntensity={0.5}
                />
              </mesh>
              
              {/* Wall trim */}
              <mesh
                position={[cell.position.x, cell.position.y + 2.05, cell.position.z]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[1.1, 0.1, 1.1]} />
                <meshPhongMaterial
                  color="#4a4a8a"
                  specular="#ffffff"
                  shininess={100}
                  emissive="#2a2a4a"
                  emissiveIntensity={0.2}
                />
              </mesh>

              {/* Wall base */}
              <mesh
                position={[cell.position.x, cell.position.y, cell.position.z]}
                receiveShadow
              >
                <boxGeometry args={[1.1, 0.1, 1.1]} />
                <meshPhongMaterial
                  color="#2a2a4a"
                  specular="#ffffff"
                  shininess={50}
                />
              </mesh>

              {/* Wall light */}
              <pointLight
                position={[cell.position.x, cell.position.y + 1.5, cell.position.z]}
                intensity={0.2}
                distance={2}
                color="#4a4a8a"
              />
            </group>
          );
        }
        return null;
      })}

      {/* Collectibles with enhanced effects */}
      {collectibles.map((collectible, index) => (
        <group
          key={index}
          position={[
            collectible.position.x,
            collectible.position.y + 1,
            collectible.position.z
          ]}
        >
          {/* Glow effect */}
          <pointLight
            intensity={1.2}
            distance={4}
            color="#ffd700"
          />
          
          {/* Collectible object */}
          <mesh
            castShadow
            onClick={() => onCollectItem(collectible.position)}
          >
            <dodecahedronGeometry args={[0.3]} />
            <meshPhysicalMaterial
              color="#ffd700"
              metalness={0.7}
              roughness={0.2}
              emissive="#ffd700"
              emissiveIntensity={0.5}
              clearcoat={0.8}
              clearcoatRoughness={0.2}
              reflectivity={1}
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
      ))}

      {/* Additional lighting */}
      <hemisphereLight
        intensity={0.7}
        color="#ffffff"
        groundColor="#2a2a4a"
      />

      {/* Volumetric effects */}
      <Cloud
        position={[0, 15, 0]}
        opacity={0.3}
        scale={20}
      />

      <Stars
        radius={50}
        depth={50}
        count={1000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </>
  );
}