'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Position3D } from '@/types/maze';
import { Sky, Stars, Cloud } from '@react-three/drei';

interface MazeEnvironmentProps {
  maze: boolean[][];
  collectibles: Position3D[];
  onCollectibleClick: (position: Position3D) => void;
}

export default function MazeEnvironment({
  maze,
  collectibles,
  onCollectibleClick
}: MazeEnvironmentProps) {
  const collectiblesRef = useRef<THREE.Group>(null);
  console.log('Rendering maze with dimensions:', maze.length, 'x', maze[0]?.length);

  // Create procedural textures
  const { wallTexture, groundTexture } = useMemo(() => {
    // Wall texture
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 1024;
    wallCanvas.height = 1024;
    const wallCtx = wallCanvas.getContext('2d')!;
    
    // Create stone-like pattern
    wallCtx.fillStyle = '#4a4a4a';
    wallCtx.fillRect(0, 0, 1024, 1024);
    
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = 20 + Math.random() * 40;
      
      const gradient = wallCtx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(100, 100, 100, ${0.3 + Math.random() * 0.4})`);
      gradient.addColorStop(1, 'rgba(74, 74, 74, 0)');
      
      wallCtx.fillStyle = gradient;
      wallCtx.beginPath();
      wallCtx.arc(x, y, radius, 0, Math.PI * 2);
      wallCtx.fill();
    }

    // Ground texture
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 1024;
    groundCanvas.height = 1024;
    const groundCtx = groundCanvas.getContext('2d')!;
    
    // Create organic ground pattern
    groundCtx.fillStyle = '#2d2d2d';
    groundCtx.fillRect(0, 0, 1024, 1024);
    
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const size = 10 + Math.random() * 30;
      
      const gradient = groundCtx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, `rgba(60, 60, 60, ${0.2 + Math.random() * 0.3})`);
      gradient.addColorStop(1, 'rgba(45, 45, 45, 0)');
      
      groundCtx.fillStyle = gradient;
      groundCtx.beginPath();
      groundCtx.arc(x, y, size, 0, Math.PI * 2);
      groundCtx.fill();
    }

    return {
      wallTexture: new THREE.CanvasTexture(wallCanvas),
      groundTexture: new THREE.CanvasTexture(groundCanvas)
    };
  }, []);

  useFrame((state) => {
    if (collectiblesRef.current) {
      collectiblesRef.current.children.forEach((child, i) => {
        // Enhanced floating animation
        child.position.y = Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.15 + 0.5;
        // Rotation animation
        child.rotation.y += 0.02;
        // Pulse light intensity
        const light = child.children.find(c => c.type === 'PointLight') as THREE.PointLight;
        if (light) {
          light.intensity = 1.5 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.5;
        }
      });
    }
  });

  return (
    <group>
      {/* Sky and Atmosphere */}
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0.6}
        azimuth={0.55}
        mieCoefficient={0.002}
        mieDirectionalG={0.8}
        rayleigh={0.25}
      />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Cloud
        position={[0, 15, -10]}
        scale={10}
        opacity={0.5}
      />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[maze[0]?.length * 2 || 2, maze.length * 2]} />
        <meshStandardMaterial
          map={groundTexture}
          roughness={0.8}
          metalness={0.2}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Debug Grid */}
      <group position={[0, 0.01, 0]}>
        {maze.map((row, z) =>
          row.map((isWall, x) => (
            <mesh
              key={`grid-${x}-${z}`}
              position={[x * 2, 0, z * 2]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[1.9, 1.9]} />
              <meshBasicMaterial
                color={isWall ? '#ff0000' : '#00ff00'}
                transparent
                opacity={0.2}
              />
            </mesh>
          ))
        )}
      </group>

      {/* Maze Walls */}
      {maze.map((row, z) =>
        row.map((isWall, x) =>
          isWall && (
            <mesh
              key={`wall-${x}-${z}`}
              position={[x * 2, 1, z * 2]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[2, 2, 2]} />
              <meshStandardMaterial
                map={wallTexture}
                roughness={0.7}
                metalness={0.3}
                envMapIntensity={0.5}
              />
            </mesh>
          )
        )
      )}

      {/* Collectibles */}
      <group ref={collectiblesRef}>
        {collectibles.map((pos, index) => (
          <group key={`collectible-${index}`} position={[pos.x, pos.y, pos.z]}>
            {/* Enhanced glow effect */}
            <pointLight
              color="#ffd700"
              intensity={1.5}
              distance={4}
              decay={2}
            />
            
            {/* Star shape */}
            <mesh
              onClick={() => onCollectibleClick(pos)}
              castShadow
            >
              <dodecahedronGeometry args={[0.3]} />
              <meshStandardMaterial
                color="#ffd700"
                emissive="#ffd700"
                emissiveIntensity={0.8}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>

            {/* Particle effect */}
            <points>
              <bufferGeometry>
                <float32BufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array(90).map(() => (Math.random() - 0.5) * 0.5), 3]}
                  count={30}
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
      </group>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.1, 0]} receiveShadow>
        <planeGeometry args={[maze[0]?.length * 2 || 2, maze.length * 2]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.9}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Enhanced Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[50, 50, 50]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <hemisphereLight
        position={[0, 50, 0]}
        intensity={0.5}
      />

      {/* Fog for depth */}
      <fog attach="fog" args={['#000720', 15, 35]} />
    </group>
  );
} 