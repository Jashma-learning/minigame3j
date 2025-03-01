export function generatePattern(level: number): number[][] {
  // Calculate grid size based on level (increases every 3 levels)
  const size = Math.min(8, 3 + Math.floor(level / 3));
  
  // Calculate number of active cells based on level
  const activeCells = Math.min(
    Math.floor(size * size * 0.6), // Maximum 60% of cells can be active
    2 + Math.floor(level * 1.5)    // Increases with level
  );

  // Initialize empty grid
  const pattern = Array(size).fill(0).map(() => Array(size).fill(0));

  // Place active cells randomly
  let placedCells = 0;
  while (placedCells < activeCells) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    
    if (pattern[row][col] === 0) {
      pattern[row][col] = 1;
      placedCells++;
    }
  }

  // Ensure pattern has some structure (optional)
  if (Math.random() < 0.5) {
    addSymmetry(pattern);
  }

  return pattern;
}

export function calculatePatternComplexity(pattern: number[][]): number {
  let complexity = 0;
  const size = pattern.length;

  // Count active cells
  const activeCells = pattern.flat().filter(cell => cell === 1).length;
  complexity += activeCells * 10;

  // Check for patterns (horizontal, vertical, diagonal)
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - 1; j++) {
      // Horizontal patterns
      if (pattern[i][j] === pattern[i][j + 1]) {
        complexity += 5;
      }
      // Vertical patterns
      if (pattern[j][i] === pattern[j + 1][i]) {
        complexity += 5;
      }
    }
  }

  // Check for diagonal patterns
  for (let i = 0; i < size - 1; i++) {
    for (let j = 0; j < size - 1; j++) {
      if (pattern[i][j] === pattern[i + 1][j + 1]) {
        complexity += 7;
      }
    }
  }

  return complexity;
}

function addSymmetry(pattern: number[][]): void {
  const size = pattern.length;
  const symmetryType = Math.floor(Math.random() * 3); // 0: horizontal, 1: vertical, 2: diagonal

  switch (symmetryType) {
    case 0: // Horizontal symmetry
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < Math.floor(size / 2); j++) {
          pattern[i][size - 1 - j] = pattern[i][j];
        }
      }
      break;
    case 1: // Vertical symmetry
      for (let i = 0; i < Math.floor(size / 2); i++) {
        for (let j = 0; j < size; j++) {
          pattern[size - 1 - i][j] = pattern[i][j];
        }
      }
      break;
    case 2: // Diagonal symmetry
      for (let i = 0; i < size; i++) {
        for (let j = i + 1; j < size; j++) {
          pattern[j][i] = pattern[i][j];
        }
      }
      break;
  }
}

export function generateHint(pattern: number[][], playerPattern: number[][]): { row: number; col: number } {
  const size = pattern.length;
  const incorrectCells: { row: number; col: number }[] = [];

  // Find all incorrect cells
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (pattern[i][j] !== playerPattern[i][j]) {
        incorrectCells.push({ row: i, col: j });
      }
    }
  }

  // Return a random incorrect cell
  return incorrectCells[Math.floor(Math.random() * incorrectCells.length)];
} 