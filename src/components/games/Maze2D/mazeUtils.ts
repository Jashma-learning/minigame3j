interface Cell {
  x: number;
  y: number;
  isWall: boolean;
  isVisited: boolean;
  isCollectible: boolean;
  isPuzzle: boolean;
  isStart: boolean;
  isEnd: boolean;
}

function initializeGrid(size: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let y = 0; y < size; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < size; x++) {
      row.push({
        x,
        y,
        isWall: true,
        isVisited: false,
        isCollectible: false,
        isPuzzle: false,
        isStart: false,
        isEnd: false
      });
    }
    grid.push(row);
  }
  return grid;
}

function getNeighbors(cell: { x: number; y: number }, size: number): { x: number; y: number }[] {
  const neighbors = [
    { x: cell.x, y: cell.y - 2 }, // North
    { x: cell.x + 2, y: cell.y }, // East
    { x: cell.x, y: cell.y + 2 }, // South
    { x: cell.x - 2, y: cell.y }  // West
  ];

  return neighbors.filter(n => 
    n.x > 0 && n.x < size - 1 && 
    n.y > 0 && n.y < size - 1
  );
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function carvePassage(
  current: { x: number; y: number },
  next: { x: number; y: number },
  maze: Cell[][]
) {
  // Mark the wall between cells as a passage
  const wallX = (current.x + next.x) / 2;
  const wallY = (current.y + next.y) / 2;
  maze[wallY][wallX].isWall = false;
  maze[next.y][next.x].isWall = false;
}

export function generateMaze2D(size: number): Cell[][] {
  // Ensure size is odd
  size = Math.max(7, size % 2 === 0 ? size + 1 : size);
  
  // Initialize the grid
  const maze = initializeGrid(size);
  const stack: { x: number; y: number }[] = [];
  const start = { x: 1, y: 1 };

  // Set start cell
  maze[start.y][start.x].isWall = false;
  maze[start.y][start.x].isStart = true;
  stack.push(start);

  // Generate maze using iterative DFS
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getNeighbors(current, size)
      .filter(n => maze[n.y][n.x].isWall);

    if (neighbors.length === 0) {
      stack.pop();
    } else {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      carvePassage(current, next, maze);
      stack.push(next);
    }
  }

  // Set end point (furthest from start)
  let maxDistance = 0;
  let endPoint = { x: 1, y: 1 };

  for (let y = 1; y < size - 1; y += 2) {
    for (let x = 1; x < size - 1; x += 2) {
      if (!maze[y][x].isWall) {
        const distance = Math.abs(x - start.x) + Math.abs(y - start.y);
        if (distance > maxDistance) {
          maxDistance = distance;
          endPoint = { x, y };
        }
      }
    }
  }
  maze[endPoint.y][endPoint.x].isEnd = true;

  // Add collectibles and puzzles
  const openCells = [];
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (!maze[y][x].isWall && !maze[y][x].isStart && !maze[y][x].isEnd) {
        openCells.push({ x, y });
      }
    }
  }

  shuffleArray(openCells);
  
  // Add 5 collectibles (increased from 3)
  for (let i = 0; i < 5 && i < openCells.length; i++) {
    const cell = openCells[i];
    maze[cell.y][cell.x].isCollectible = true;
  }

  // Add 2 puzzles
  for (let i = 5; i < 7 && i < openCells.length; i++) {
    const cell = openCells[i];
    maze[cell.y][cell.x].isPuzzle = true;
  }

  return maze;
} 