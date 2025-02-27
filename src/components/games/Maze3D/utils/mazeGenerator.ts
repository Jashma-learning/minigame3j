import { MazeLevel, Position3D, MazeCell } from '../types';
import { createNoise2D } from 'simplex-noise';

// Initialize noise generator
const noise2D = createNoise2D();

interface PathNode {
  x: number;
  z: number;
  parent: PathNode | null;
  g: number;
  h: number;
  f: number;
}

function generateNoise(x: number, z: number, scale: number = 0.1): number {
  return noise2D(x * scale, z * scale);
}

function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

export function generateMazeLevel(level: number): MazeLevel {
  const baseSize = 15;
  const width = baseSize + (level - 1) * 2;
  const height = baseSize + (level - 1) * 2;
  const totalHeight = height + 2;
  
  // Initialize grid with noise-based terrain
  const grid: boolean[][] = Array(totalHeight).fill(null).map((_, z) => 
    Array(width).fill(null).map((_, x) => {
      const noiseValue = generateNoise(x, z, 0.2);
      return noiseValue > 0.3; // Threshold for wall generation
    })
  );

  // Create entry area
  const entryX = Math.floor(width / 2);
  for (let z = 0; z < 2; z++) {
    for (let x = entryX - 1; x <= entryX + 1; x++) {
      grid[z][x] = false;
    }
  }

  // Start and end positions
  const start: Position3D = { x: entryX, y: 0, z: 0 };
  const end: Position3D = {
    x: width - 2 - Math.floor(Math.random() * (width / 4)),
    y: 0,
    z: height - 2 - Math.floor(Math.random() * (height / 4))
  };

  // Generate main path using A* with smoothing
  const mainPath = findPath(grid, start, end);
  if (mainPath) {
    // Smooth the main path
    const smoothedPath = smoothPath(mainPath);
    
    // Carve the smoothed path
    smoothedPath.forEach((pos, i) => {
      const nextPos = smoothedPath[i + 1];
      if (nextPos) {
        carvePath(grid, pos, nextPos);
      }
    });

    // Generate side paths
    generateSidePaths(grid, smoothedPath);
  }

  // Convert grid to cells array
  const cells: MazeCell[] = [];
  const collectibles: MazeCell[] = [];

  // Process grid to create cells and add variation
  for (let z = 0; z < totalHeight; z++) {
    for (let x = 0; x < width; x++) {
      if (grid[z][x]) {
        // Add wall with height variation based on noise
        const heightNoise = generateNoise(x, z, 0.4);
        cells.push({
          type: 'wall',
          position: { 
            x,
            y: heightNoise * 0.5, // Vary wall height
            z: z - 2 // Offset for entry area
          }
        });
      } else {
        cells.push({
          type: 'path',
          position: { x, y: 0, z: z - 2 }
        });
      }
    }
  }

  // Add collectibles along the path
  if (mainPath) {
    const collectiblePositions = generateCollectiblePositions(mainPath, grid, 5 + level);
    collectiblePositions.forEach(pos => {
      collectibles.push({
        type: 'collectible',
        position: { ...pos, z: pos.z - 2 }
      });
    });
  }

  return {
    cells,
    collectibles,
    start: { ...start, z: -2 },
    end,
    size: { width, height }
  };
}

// A* pathfinding with diagonal movement
function findPath(grid: boolean[][], start: Position3D, end: Position3D): Position3D[] | null {
  const openSet: PathNode[] = [];
  const closedSet = new Set<string>();
  
  const startNode: PathNode = {
    x: start.x,
    z: start.z,
    parent: null,
    g: 0,
    h: heuristic({ x: start.x, z: start.z }, { x: end.x, z: end.z }),
    f: 0
  };
  startNode.f = startNode.g + startNode.h;
  
  openSet.push(startNode);

  while (openSet.length > 0) {
    let current = openSet.reduce((min, node) => node.f < min.f ? node : min);
    
    if (current.x === end.x && current.z === end.z) {
      return reconstructPath(current);
    }

    openSet.splice(openSet.indexOf(current), 1);
    closedSet.add(`${current.x},${current.z}`);

    const neighbors = getNeighbors(current, grid);
    for (const neighbor of neighbors) {
      if (closedSet.has(`${neighbor.x},${neighbor.z}`)) continue;

      const tentativeG = current.g + 1;
      const existing = openSet.find(node => node.x === neighbor.x && node.z === neighbor.z);
      
      if (!existing) {
        neighbor.g = tentativeG;
        neighbor.h = heuristic(neighbor, { x: end.x, z: end.z });
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = current;
        openSet.push(neighbor);
      } else if (tentativeG < existing.g) {
        existing.g = tentativeG;
        existing.f = existing.g + existing.h;
        existing.parent = current;
      }
    }
  }

  return null;
}

function heuristic(a: { x: number, z: number }, b: { x: number, z: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
}

function getNeighbors(node: PathNode, grid: boolean[][]): PathNode[] {
  const directions = [
    { x: 0, z: -1 }, { x: 1, z: -1 }, { x: 1, z: 0 }, { x: 1, z: 1 },
    { x: 0, z: 1 }, { x: -1, z: 1 }, { x: -1, z: 0 }, { x: -1, z: -1 }
  ];

  return directions
    .map(dir => ({
      x: node.x + dir.x,
      z: node.z + dir.z,
      parent: null,
      g: 0,
      h: 0,
      f: 0
    }))
    .filter(n => 
      n.x >= 0 && n.x < grid[0].length &&
      n.z >= 0 && n.z < grid.length &&
      !grid[n.z][n.x]
    );
}

function reconstructPath(endNode: PathNode): Position3D[] {
  const path: Position3D[] = [];
  let current: PathNode | null = endNode;
  
  while (current) {
    path.unshift({ x: current.x, y: 0, z: current.z });
    current = current.parent;
  }
  
  return path;
}

function smoothPath(path: Position3D[]): Position3D[] {
  if (path.length <= 2) return path;

  const smoothed: Position3D[] = [path[0]];
  const tension = 0.5;

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];

    // Calculate control points for curve
    const cp1x = current.x + (next.x - prev.x) * tension;
    const cp1z = current.z + (next.z - prev.z) * tension;

    // Add intermediate points
    for (let t = 0; t <= 1; t += 0.2) {
      const x = smoothstep(prev.x, cp1x, t);
      const z = smoothstep(prev.z, cp1z, t);
      smoothed.push({ x: Math.round(x), y: 0, z: Math.round(z) });
    }
  }

  smoothed.push(path[path.length - 1]);
  return smoothed;
}

function carvePath(grid: boolean[][], from: Position3D, to: Position3D) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const steps = Math.max(Math.abs(dx), Math.abs(dz));
  
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const x = Math.round(from.x + dx * t);
    const z = Math.round(from.z + dz * t);
    
    // Carve wider path
    for (let ox = -1; ox <= 1; ox++) {
      for (let oz = -1; oz <= 1; oz++) {
        const nx = x + ox;
        const nz = z + oz;
        if (nx >= 0 && nx < grid[0].length && nz >= 0 && nz < grid.length) {
          grid[nz][nx] = false;
        }
      }
    }
  }
}

function generateSidePaths(grid: boolean[][], mainPath: Position3D[]) {
  mainPath.forEach((pos, i) => {
    if (i % 3 === 0) { // Create side paths periodically
      const directions = [
        { x: 1, z: 0 }, { x: -1, z: 0 },
        { x: 0, z: 1 }, { x: 0, z: -1 }
      ];

      directions.forEach(dir => {
        let current = { x: pos.x, z: pos.z };
        const length = Math.floor(Math.random() * 4) + 2;

        for (let step = 0; step < length; step++) {
          const nx = current.x + dir.x;
          const nz = current.z + dir.z;

          if (nx >= 0 && nx < grid[0].length && nz >= 0 && nz < grid.length) {
            grid[nz][nx] = false;
            current = { x: nx, z: nz };
          }
        }
      });
    }
  });
}

function generateCollectiblePositions(
  mainPath: Position3D[],
  grid: boolean[][],
  count: number
): Position3D[] {
  const positions: Position3D[] = [];
  const pathSet = new Set(mainPath.map(p => `${p.x},${p.z}`));
  
  // Find potential positions near the path
  const candidates: Position3D[] = [];
  mainPath.forEach(pos => {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        const x = pos.x + dx;
        const z = pos.z + dz;
        if (x >= 0 && x < grid[0].length && z >= 0 && z < grid.length &&
            !grid[z][x] && !pathSet.has(`${x},${z}`)) {
          candidates.push({ x, y: 0.5, z });
        }
      }
    }
  });

  // Randomly select positions
  while (positions.length < count && candidates.length > 0) {
    const index = Math.floor(Math.random() * candidates.length);
    positions.push(candidates[index]);
    candidates.splice(index, 1);
  }

  return positions;
} 