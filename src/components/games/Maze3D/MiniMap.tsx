import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Position3D, MazeCell } from './types';

interface MiniMapProps {
  cells: MazeCell[];
  playerPosition: Position3D;
  playerRotation: number;
  collectibles: MazeCell[];
  size?: number;
}

export default function MiniMap({ 
  cells, 
  playerPosition, 
  playerRotation = 0,
  collectibles,
  size = 180 
}: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate grid dimensions
  const gridDimensions = {
    width: Math.max(...cells.map(cell => cell.position.x)) + 1,
    height: Math.max(...cells.map(cell => cell.position.z)) + 1
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with a gradient background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate cell size and offset for centering
    const cellSize = Math.min(
      (canvas.width - 16) / gridDimensions.width,
      (canvas.height - 16) / gridDimensions.height
    );
    const offsetX = (canvas.width - cellSize * gridDimensions.width) / 2;
    const offsetY = (canvas.height - cellSize * gridDimensions.height) / 2;

    // Draw grid with improved visibility
    ctx.strokeStyle = 'rgba(147, 51, 234, 0.15)';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= gridDimensions.width; x++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + x * cellSize, offsetY);
      ctx.lineTo(offsetX + x * cellSize, offsetY + gridDimensions.height * cellSize);
      ctx.stroke();
    }
    for (let y = 0; y <= gridDimensions.height; y++) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + y * cellSize);
      ctx.lineTo(offsetX + gridDimensions.width * cellSize, offsetY + y * cellSize);
      ctx.stroke();
    }

    // Draw walls with improved style
    cells.forEach(cell => {
      if (cell.type === 'wall') {
        // Wall shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(
          offsetX + cell.position.x * cellSize + 1,
          offsetY + cell.position.z * cellSize + 1,
          cellSize - 1,
          cellSize - 1
        );

        // Wall fill with gradient
        const wallGradient = ctx.createLinearGradient(
          offsetX + cell.position.x * cellSize,
          offsetY + cell.position.z * cellSize,
          offsetX + (cell.position.x + 1) * cellSize,
          offsetY + (cell.position.z + 1) * cellSize
        );
        wallGradient.addColorStop(0, '#4a5568');
        wallGradient.addColorStop(1, '#2d3748');
        ctx.fillStyle = wallGradient;
        ctx.fillRect(
          offsetX + cell.position.x * cellSize,
          offsetY + cell.position.z * cellSize,
          cellSize - 1,
          cellSize - 1
        );
      }
    });

    // Draw collectibles with enhanced effects
    collectibles.forEach(collectible => {
      // Outer glow
      const gradient = ctx.createRadialGradient(
        offsetX + (collectible.position.x + 0.5) * cellSize,
        offsetY + (collectible.position.z + 0.5) * cellSize,
        0,
        offsetX + (collectible.position.x + 0.5) * cellSize,
        offsetY + (collectible.position.z + 0.5) * cellSize,
        cellSize * 0.8
      );
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
      gradient.addColorStop(0.6, 'rgba(255, 215, 0, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(
        offsetX + (collectible.position.x - 0.3) * cellSize,
        offsetY + (collectible.position.z - 0.3) * cellSize,
        cellSize * 1.6,
        cellSize * 1.6
      );

      // Inner glow
      const innerGradient = ctx.createRadialGradient(
        offsetX + (collectible.position.x + 0.5) * cellSize,
        offsetY + (collectible.position.z + 0.5) * cellSize,
        0,
        offsetX + (collectible.position.x + 0.5) * cellSize,
        offsetY + (collectible.position.z + 0.5) * cellSize,
        cellSize * 0.3
      );
      innerGradient.addColorStop(0, '#ffd700');
      innerGradient.addColorStop(1, '#ffa000');
      ctx.fillStyle = innerGradient;
      ctx.beginPath();
      ctx.arc(
        offsetX + (collectible.position.x + 0.5) * cellSize,
        offsetY + (collectible.position.z + 0.5) * cellSize,
        cellSize * 0.25,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Draw player position with enhanced effects
    // Player outer glow
    const playerGradient = ctx.createRadialGradient(
      offsetX + (playerPosition.x + 0.5) * cellSize,
      offsetY + (playerPosition.z + 0.5) * cellSize,
      0,
      offsetX + (playerPosition.x + 0.5) * cellSize,
      offsetY + (playerPosition.z + 0.5) * cellSize,
      cellSize
    );
    playerGradient.addColorStop(0, 'rgba(147, 51, 234, 0.6)');
    playerGradient.addColorStop(0.6, 'rgba(147, 51, 234, 0.2)');
    playerGradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
    ctx.fillStyle = playerGradient;
    ctx.fillRect(
      offsetX + (playerPosition.x - 0.5) * cellSize,
      offsetY + (playerPosition.z - 0.5) * cellSize,
      cellSize * 2,
      cellSize * 2
    );

    // Player inner glow
    const playerInnerGradient = ctx.createRadialGradient(
      offsetX + (playerPosition.x + 0.5) * cellSize,
      offsetY + (playerPosition.z + 0.5) * cellSize,
      0,
      offsetX + (playerPosition.x + 0.5) * cellSize,
      offsetY + (playerPosition.z + 0.5) * cellSize,
      cellSize * 0.4
    );
    playerInnerGradient.addColorStop(0, '#9333ea');
    playerInnerGradient.addColorStop(1, '#7e22ce');
    ctx.fillStyle = playerInnerGradient;
    ctx.beginPath();
    ctx.arc(
      offsetX + (playerPosition.x + 0.5) * cellSize,
      offsetY + (playerPosition.z + 0.5) * cellSize,
      cellSize * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Add direction indicator
    ctx.beginPath();
    ctx.moveTo(
      offsetX + (playerPosition.x + 0.5) * cellSize,
      offsetY + (playerPosition.z + 0.5) * cellSize
    );
    ctx.lineTo(
      offsetX + (playerPosition.x + 0.5 + Math.cos(playerRotation) * 0.4) * cellSize,
      offsetY + (playerPosition.z + 0.5 + Math.sin(playerRotation) * 0.4) * cellSize
    );
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [cells, playerPosition, playerRotation, collectibles, gridDimensions, size]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      className="relative w-full h-full"
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full h-full rounded-xl"
        style={{
          filter: 'drop-shadow(0 0 10px rgba(147, 51, 234, 0.2))',
        }}
      />
      <div className="absolute top-3 left-3 text-sm text-purple-300 font-medium
                    bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
        Mini-map
      </div>
    </motion.div>
  );
}