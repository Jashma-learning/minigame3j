'use client';

import { MazeLevel, Position3D, MazeCell } from '@/types/maze';

function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function createCell(x: number, y: number, z: number, type: CellType): MazeCell {
  return {
    id: generateUniqueId(),
    position: { x, y, z },
    type,
    isActive: false,
    isVisited: false
  };
}

function createCollectible(x: number, y: number, z: number, value: number): CollectibleItem {
  return {
    id: generateUniqueId(),
    position: { x, y, z },
    type: 'collectible',
    value,
    isActive: false,
    isVisited: false
  };
}

export function generateMazeLevel(level: number): MazeLevel {
  const size = {
    width: 15,
    height: 15,
    depth: 15
  };

  // Initialize cells array
  const cells: MazeCell[] = [];
  const visited: boolean[][] = Array(size.height).fill(null).map(() => Array(size.width).fill(false));
  
  // Create walls
  for (let z = 0; z < size.height; z++) {
    for (let x = 0; x < size.width; x++) {
      cells.push({
        type: 'wall',
        position: { x, y: 0, z }
      });
    }
  }

  // Start position
  const startPosition: Position3D = { x: 1, y: 0, z: 1 };
  const stack: Position3D[] = [startPosition];
  
  // Mark start position
  visited[startPosition.z][startPosition.x] = true;
  cells.push({
    type: 'start',
    position: startPosition
  });

  // Generate maze paths using DFS
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, visited);

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
    visited[next.z][next.x] = true;

    // Create path by removing walls
    const pathX = (current.x + next.x) / 2;
    const pathZ = (current.z + next.z) / 2;
    
    // Remove walls at current, path, and next positions
    cells.push(
      { type: 'path', position: { x: current.x, y: 0, z: current.z } },
      { type: 'path', position: { x: pathX, y: 0, z: pathZ } },
      { type: 'path', position: { x: next.x, y: 0, z: next.z } }
    );

    stack.push(next);
  }

  // Add end position
  const endPosition: Position3D = { x: size.width - 2, y: 0, z: size.height - 2 };
  cells.push({
    type: 'end',
    position: endPosition
  });

  // Add collectibles
  const collectibles: MazeCell[] = [];
  const pathCells = cells.filter(cell => 
    cell.type === 'path' && 
    !(cell.position.x === startPosition.x && cell.position.z === startPosition.z) &&
    !(cell.position.x === endPosition.x && cell.position.z === endPosition.z)
  );

  // Randomly select 4 path cells for collectibles
  for (let i = 0; i < 4; i++) {
    if (pathCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * pathCells.length);
      const cell = pathCells.splice(randomIndex, 1)[0];
      collectibles.push({
        type: 'collectible',
        position: cell.position
      });
    }
  }

  console.log('Generated maze cells:', cells.length);
  console.log('Generated collectibles:', collectibles.length);

  return {
    cells,
    collectibles,
    size,
    startPosition,
    endPosition,
    minimumRequiredItems: [],
    difficulty: level
  };
}

function getUnvisitedNeighbors(pos: Position3D, visited: boolean[][]): Position3D[] {
  const neighbors: Position3D[] = [];
  const directions = [
    { x: 0, z: -2 }, // North
    { x: 2, z: 0 },  // East
    { x: 0, z: 2 },  // South
    { x: -2, z: 0 }  // West
  ];

  for (const dir of directions) {
    const newX = pos.x + dir.x;
    const newZ = pos.z + dir.z;

    if (
      newX > 0 && newX < visited[0].length - 1 &&
      newZ > 0 && newZ < visited.length - 1 &&
      !visited[newZ][newX]
    ) {
      neighbors.push({ x: newX, y: 0, z: newZ });
    }
  }

  return neighbors;
} 