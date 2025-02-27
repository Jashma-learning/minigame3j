import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { Position3D, Wall } from '../types';

// Constants for player movement and physics
const PLAYER_HEIGHT = 1.7;
const HEAD_BOB_SPEED = 12;
const HEAD_BOB_INTENSITY = 0.05;
const JUMP_FORCE = 0.15;
const GRAVITY = 0.006;
const ACCELERATION = 40;
const FRICTION = 12;
const BASE_SPEED = 5;
const SPRINT_SPEED = 10;
const CAMERA_TILT = -0.1;
const WALL_SLIDE_THRESHOLD = 0.3;

interface PlayerProps {
  position: Position3D;
  setPosition: (position: Position3D) => void;
  domElement: HTMLCanvasElement | null;
  isActive: boolean;
  walls: Wall[];
}

export function Player({ position, setPosition, domElement, isActive, walls }: PlayerProps) {
  const controlsRef = useRef<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const velocityRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const jumpVelocityRef = useRef(0);
  const isJumpingRef = useRef(false);
  const lastJumpTimeRef = useRef(0);
  const moveStateRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false,
    jump: false
  });
  const { camera } = useThree();

  useEffect(() => {
    if (!domElement || !isActive) return;

    const onPointerLockChange = () => {
      setIsLocked(document.pointerLockElement === domElement);
    };

    const onPointerLockError = (event: Event) => {
      console.warn('Pointer Lock Error:', event);
      setIsLocked(false);
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('pointerlockerror', onPointerLockError);

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      
      // Exit pointer lock when component unmounts
      if (document.pointerLockElement === domElement) {
        document.exitPointerLock();
      }
    };
  }, [domElement, isActive]);

  useEffect(() => {
    if (!domElement || !isActive) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isLocked) return;

      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveStateRef.current.forward = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveStateRef.current.backward = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveStateRef.current.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveStateRef.current.right = true;
          break;
        case 'ShiftLeft':
          moveStateRef.current.shift = true;
          break;
        case 'Space':
          const currentTime = performance.now();
          if (!isJumpingRef.current && currentTime - lastJumpTimeRef.current > 500) {
            isJumpingRef.current = true;
            jumpVelocityRef.current = JUMP_FORCE;
            lastJumpTimeRef.current = currentTime;
          }
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (!isLocked) return;

      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveStateRef.current.forward = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveStateRef.current.backward = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveStateRef.current.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveStateRef.current.right = false;
          break;
        case 'ShiftLeft':
          moveStateRef.current.shift = false;
          break;
      }
    };

    const onClick = () => {
      if (!isLocked && controlsRef.current) {
        try {
          controlsRef.current.lock();
        } catch (error) {
          console.warn('Failed to acquire pointer lock:', error);
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    domElement.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      domElement.removeEventListener('click', onClick);
    };
  }, [domElement, isActive, isLocked]);

  useFrame((state, delta) => {
    if (!isLocked) return;

    const speed = moveStateRef.current.shift ? SPRINT_SPEED : BASE_SPEED;
    const velocity = velocityRef.current;

    // Calculate movement direction
    const moveDirection = new THREE.Vector3();
    
    if (moveStateRef.current.forward) moveDirection.z -= 1;
    if (moveStateRef.current.backward) moveDirection.z += 1;
    if (moveStateRef.current.left) moveDirection.x -= 1;
    if (moveStateRef.current.right) moveDirection.x += 1;

    moveDirection.normalize();
    moveDirection.applyQuaternion(state.camera.quaternion);
    moveDirection.y = 0;
    moveDirection.normalize();
    moveDirection.multiplyScalar(speed * delta);

    // Update velocity with acceleration and friction
    velocity.x += moveDirection.x * ACCELERATION * delta;
    velocity.z += moveDirection.z * ACCELERATION * delta;

    // Apply friction
    velocity.x -= velocity.x * FRICTION * delta;
    velocity.z -= velocity.z * FRICTION * delta;

    // Handle jumping and gravity
    if (isJumpingRef.current) {
      jumpVelocityRef.current -= GRAVITY;
      position.y += jumpVelocityRef.current;

      // Check for landing
      if (position.y <= 0) {
        position.y = 0;
        isJumpingRef.current = false;
        jumpVelocityRef.current = 0;
      }
    }

    // Calculate new position
    const newPosition = {
      x: position.x + velocity.x,
      y: position.y,
      z: position.z + velocity.z
    };

    // Enhanced collision detection with wall sliding
    const playerRadius = 0.5;
    let canMove = true;
    let closestWall: { wall: Wall; distance: number } | null = null;

    for (const wall of walls) {
      const dx = newPosition.x - wall.position.x;
      const dz = newPosition.z - wall.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      const minDistance = playerRadius + Math.max(...wall.scale) / 2;

      if (distance < minDistance) {
        canMove = false;
        if (!closestWall || distance < closestWall.distance) {
          closestWall = { wall, distance };
        }
      }
    }

    if (canMove) {
      setPosition(newPosition);
    } else if (closestWall) {
      // Wall sliding logic
      const wall = closestWall.wall;
      const dx = position.x - wall.position.x;
      const dz = position.z - wall.position.z;
      const angle = Math.atan2(dz, dx);

      // Try sliding along the wall
      const slideX = position.x + velocity.x * Math.cos(angle + Math.PI / 2) * WALL_SLIDE_THRESHOLD;
      const slideZ = position.z + velocity.z * Math.sin(angle + Math.PI / 2) * WALL_SLIDE_THRESHOLD;

      let canSlideX = true;
      let canSlideZ = true;

      // Check if sliding positions are valid
      for (const w of walls) {
        const slideDistX = Math.sqrt(Math.pow(slideX - w.position.x, 2) + Math.pow(position.z - w.position.z, 2));
        const slideDistZ = Math.sqrt(Math.pow(position.x - w.position.x, 2) + Math.pow(slideZ - w.position.z, 2));
        const minDist = playerRadius + Math.max(...w.scale) / 2;

        if (slideDistX < minDist) canSlideX = false;
        if (slideDistZ < minDist) canSlideZ = false;
      }

      // Apply sliding movement if possible
      if (canSlideX) setPosition({ ...position, x: slideX });
      else if (canSlideZ) setPosition({ ...position, z: slideZ });
    }

    // Update camera position with head bob effect
    const isMoving = Math.abs(velocity.x) > 0.1 || Math.abs(velocity.z) > 0.1;
    const headBob = isMoving 
      ? Math.sin(state.clock.elapsedTime * HEAD_BOB_SPEED) * HEAD_BOB_INTENSITY * (moveStateRef.current.shift ? 1.5 : 1)
      : 0;

    camera.position.set(
      position.x,
      PLAYER_HEIGHT + position.y + headBob,
      position.z
    );

    // Tilt camera slightly up for better visibility
    camera.rotation.x = CAMERA_TILT;
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      domElement={domElement || undefined}
    />
  );
} 