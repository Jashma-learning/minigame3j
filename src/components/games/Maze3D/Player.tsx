'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { Position3D, Wall } from '@/types/maze';

interface PlayerProps {
  position: Position3D;
  rotation: number;
  onMove: (newPosition: Position3D) => void;
  isActive: boolean;
  walls: Wall[];
  domElement: HTMLCanvasElement | null;
}

// Camera and movement settings
const CAMERA_CONFIG = {
  height: 1.7,           // Player eye height
  bobbing: 0.15,         // Camera bobbing amount
  bobbingSpeed: 0.8,     // Camera bobbing speed
  turnSpeed: 2.5,        // Mouse turn sensitivity
  moveSpeed: 5.0,        // Base movement speed
  sprintSpeed: 8.0,      // Sprint movement speed
  smoothing: 0.15,       // Camera movement smoothing
  collisionRadius: 0.3,  // Player collision radius
};

export default function Player({ position, rotation, onMove, isActive, walls, domElement }: PlayerProps) {
  const controlsRef = useRef<any>(null);
  const playerRef = useRef<THREE.Group>(null);
  const velocityRef = useRef(new THREE.Vector3());
  const bobbingRef = useRef(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const [isLocked, setIsLocked] = useState(false);
  const { camera } = useThree();

  // Initialize camera
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.y = CAMERA_CONFIG.height;
      camera.fov = 75;
      camera.near = 0.1;
      camera.far = 100;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  // Handle pointer lock changes
  useEffect(() => {
    const handleLockChange = () => {
      setIsLocked(document.pointerLockElement === document.body);
    };

    document.addEventListener('pointerlockchange', handleLockChange);
    document.addEventListener('mozpointerlockchange', handleLockChange);
    document.addEventListener('webkitpointerlockchange', handleLockChange);

    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
      document.removeEventListener('mozpointerlockchange', handleLockChange);
      document.removeEventListener('webkitpointerlockchange', handleLockChange);
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (controlsRef.current) {
          controlsRef.current.unlock();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Handle movement and collision
  useFrame((state, delta) => {
    if (!isActive || !isLocked) return;

    const isSprinting = keysRef.current['ShiftLeft'] || keysRef.current['ShiftRight'];
    const speed = isSprinting ? CAMERA_CONFIG.sprintSpeed : CAMERA_CONFIG.moveSpeed;
    
    // Calculate movement direction
    const moveDirection = new THREE.Vector3();
    if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) moveDirection.z -= 1;
    if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) moveDirection.z += 1;
    if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) moveDirection.x -= 1;
    if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) moveDirection.x += 1;

    // Normalize and apply speed
    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize().multiplyScalar(speed * delta);
      
      // Apply camera bobbing
      if (playerRef.current) {
        bobbingRef.current += delta * CAMERA_CONFIG.bobbingSpeed * speed;
        const bobAmount = Math.sin(bobbingRef.current) * CAMERA_CONFIG.bobbing;
        playerRef.current.position.y = CAMERA_CONFIG.height + bobAmount;
      }
    }

    // Get camera direction
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const cameraRotation = Math.atan2(cameraDirection.x, cameraDirection.z);

    // Rotate movement vector based on camera direction
    moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotation);

    // Calculate new position
    const newX = position.x + moveDirection.x;
    const newZ = position.z + moveDirection.z;

    // Check wall collisions
    let canMove = true;
    for (const wall of walls) {
      const dx = newX - wall.position.x;
      const dz = newZ - wall.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < CAMERA_CONFIG.collisionRadius + Math.max(...wall.scale) / 2) {
        canMove = false;
        break;
      }
    }

    if (canMove) {
      onMove({ ...position, x: newX, z: newZ });
    }
  });

  // Event handlers for keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive || !isLocked) return;
      keysRef.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isActive || !isLocked) return;
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive, isLocked]);

  return (
    <group ref={playerRef}>
      <PointerLockControls 
        ref={controlsRef}
        onLock={() => setIsLocked(true)}
        onUnlock={() => setIsLocked(false)}
      />
      
      {!isLocked && isActive && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '20px',
            textAlign: 'center',
            userSelect: 'none',
            cursor: 'pointer',
          }}
          onClick={() => controlsRef.current?.lock()}
        >
          Click to play
        </div>
      )}
      
      {/* Player model */}
      <group position={[position.x, 0, position.z]} rotation={[0, rotation, 0]}>
        {/* Body */}
        <mesh castShadow position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1.5, 8]} />
          <meshPhongMaterial color="#4a90e2" />
        </mesh>
        
        {/* Head */}
        <mesh castShadow position={[0, 1.6, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshPhongMaterial color="#f5deb3" />
        </mesh>

        {/* Player light */}
        <pointLight
          position={[0, 1.5, 0]}
          intensity={0.7}
          distance={5}
          color="#ffaa44"
          castShadow
        />
      </group>
    </group>
  );
} 