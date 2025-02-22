import { GameObject } from '@/types/game';

const GEOMETRIES = ['crystal', 'key', 'dragon', 'potion', 'compass'] as const;
const COLORS = ['#FFD700', '#4169E1', '#FF1493', '#7B68EE', '#00FA9A'];

export function generateRandomObjects(
  count: number,
  positions: [number, number][]
): GameObject[] {
  // Ensure we have enough positions
  if (positions.length < count) {
    throw new Error('Not enough positions for the requested number of objects');
  }

  // Shuffle positions to get random unique positions
  const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);
  
  // Take exactly the number of positions we need
  const selectedPositions = shuffledPositions.slice(0, count);
  
  // Generate objects with unique positions
  return selectedPositions.map((position, index) => {
    const geometry = GEOMETRIES[Math.floor(Math.random() * GEOMETRIES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    return {
      id: `object-${index}`,
      position,
      geometry,
      color,
      glow: Math.random() > 0.5
    };
  });
}

export function calculateScore(
  originalObjects: GameObject[],
  placedObjects: GameObject[],
  explorationTime: number,
  recallTime: number
): number {
  let score = 0;
  const maxDistance = 0.5; // Maximum distance for a "correct" placement
  
  placedObjects.forEach(placed => {
    const original = originalObjects.find(obj => obj.id === placed.id);
    if (original) {
      const distance = calculateDistance(placed.position, original.position);
      if (distance <= maxDistance) {
        score += 1;
      }
    }
  });
  
  // Convert to percentage
  const accuracy = (score / originalObjects.length) * 100;
  
  // Time bonus: faster times increase the score
  const timeBonus = Math.max(0, 1 - ((explorationTime + recallTime) / 30)); // Bonus for completing within 30 seconds
  
  return Math.min(100, accuracy * (1 + timeBonus));
}

export function calculateDistance(pos1: [number, number], pos2: [number, number]): number {
  const [x1, y1] = pos1;
  const [x2, y2] = pos2;
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function generateGridPositions(size: number): [number, number][] {
  const positions: [number, number][] = [];
  
  // Generate all possible grid positions
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      positions.push([x, y]);
    }
  }
  
  return positions;
} 