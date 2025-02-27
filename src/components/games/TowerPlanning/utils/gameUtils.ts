interface Level {
  disks: number[];
  towers: number[][];
}

export function generateLevel(level: number): Level {
  // Calculate number of disks based on level
  // Start with 3 disks and add one every 2 levels
  const numDisks = Math.min(3 + Math.floor((level - 1) / 2), 7);
  
  // Generate disks array (largest to smallest)
  const disks = Array.from({ length: numDisks }, (_, i) => numDisks - i);
  
  // Initial tower state
  const towers: number[][] = [
    [...disks], // Source tower
    [], // Auxiliary tower
    [] // Target tower
  ];
  
  return { disks, towers };
}

export function calculateOptimalMoves(
  numDisks: number,
  source: number = 0,
  auxiliary: number = 1,
  target: number = 2
): Array<{ from: number; to: number }> {
  const moves: Array<{ from: number; to: number }> = [];
  
  function hanoi(n: number, from: number, aux: number, to: number) {
    if (n === 1) {
      moves.push({ from, to });
      return;
    }
    
    hanoi(n - 1, from, to, aux);
    moves.push({ from, to });
    hanoi(n - 1, aux, from, to);
  }
  
  hanoi(numDisks, source, auxiliary, target);
  return moves;
}

export function getNextOptimalMove(
  currentTowers: number[][],
  targetTowers: number[][]
): { from: number; to: number } | null {
  // Get the number of disks
  const numDisks = currentTowers[0].length + currentTowers[1].length + currentTowers[2].length;
  
  // Calculate all optimal moves
  const optimalMoves = calculateOptimalMoves(numDisks);
  
  // Find the current state in the sequence of moves
  let currentStateIndex = -1;
  let currentState = [...currentTowers.map(tower => [...tower])];
  
  for (let i = 0; i <= optimalMoves.length; i++) {
    if (arraysEqual(currentState, currentTowers)) {
      currentStateIndex = i;
      break;
    }
    
    if (i < optimalMoves.length) {
      const move = optimalMoves[i];
      const disk = currentState[move.from].pop()!;
      currentState[move.to].push(disk);
    }
  }
  
  // Return the next move if found
  if (currentStateIndex >= 0 && currentStateIndex < optimalMoves.length) {
    return optimalMoves[currentStateIndex];
  }
  
  return null;
}

function arraysEqual(a: number[][], b: number[][]): boolean {
  return a.length === b.length &&
    a.every((row, i) =>
      row.length === b[i].length &&
      row.every((val, j) => val === b[i][j])
    );
} 