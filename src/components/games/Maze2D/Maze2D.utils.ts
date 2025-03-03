import { Maze2DGameState, Maze2DMetrics } from '../../../types/cognitive/maze2d.types';

/**
 * Calculates the mean of an array of numbers
 * @param numbers - Array of numbers to calculate mean from
 * @returns The mean value or 0 if array is empty
 */
const calculateMean = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
};

/**
 * Calculates the standard deviation of an array of numbers
 * @param numbers - Array of numbers to calculate standard deviation from
 * @returns The standard deviation or 0 if array has less than 2 elements
 */
const calculateStandardDeviation = (numbers: number[]): number => {
  if (numbers.length < 2) return 0;
  const mean = calculateMean(numbers);
  const squareDiffs = numbers.map(n => Math.pow(n - mean, 2));
  const variance = calculateMean(squareDiffs);
  return Math.sqrt(variance);
};

/**
 * Calculates cognitive metrics from Maze2D game state
 * @param gameState - The raw game state from gameplay
 * @returns Processed cognitive metrics
 */
export const calculateMaze2DMetrics = (gameState: Maze2DGameState): Maze2DMetrics => {
  // Extract relevant values from game state
  const {
    path,
    timeElapsed,
    wallCollisions,
    revisitedCells,
    totalCells,
    cellsVisited,
    hintsUsed,
    difficulty,
    completed,
    optimalPathLength,
    actualPathLength,
    moveTimes,
    decisionPointTimes
  } = gameState;

  // Calculate spatial navigation metrics
  const pathEfficiency = calculatePathEfficiency(optimalPathLength, actualPathLength);
  const explorationCoverage = calculateExplorationCoverage(cellsVisited, totalCells);
  const spatialMemory = calculateSpatialMemory(revisitedCells, actualPathLength);
  const wayfindingPrecision = calculateWayfindingPrecision(wallCollisions, actualPathLength);
  const routePlanning = calculateRoutePlanning(path, optimalPathLength, actualPathLength);

  // Calculate decision making metrics
  const decisionSpeed = calculateDecisionSpeed(decisionPointTimes);
  const decisionConsistency = calculateDecisionConsistency(decisionPointTimes);
  const explorationStrategy = calculateExplorationStrategy(path, cellsVisited, totalCells);
  const adaptiveDecisionMaking = calculateAdaptiveDecisionMaking(path, wallCollisions);
  const confidenceLevel = calculateConfidenceLevel(moveTimes, hintsUsed);

  // Calculate problem solving metrics
  const solutionTime = timeElapsed;
  const hintsReliance = calculateHintsReliance(hintsUsed, difficulty);
  const errorCorrection = calculateErrorCorrection(wallCollisions, path);
  const obstacleManagement = calculateObstacleManagement(path, wallCollisions);
  const solutionOptimality = calculateSolutionOptimality(optimalPathLength, actualPathLength, completed);

  // Calculate attention metrics
  const focusMaintenance = calculateFocusMaintenance(moveTimes);
  const distractionResistance = calculateDistractionResistance(revisitedCells, cellsVisited);
  const attentionalStamina = calculateAttentionalStamina(path, timeElapsed);
  const vigilanceLevel = calculateVigilanceLevel(wallCollisions, actualPathLength);
  const attentionalLapses = calculateAttentionalLapses(moveTimes);

  // Calculate overall performance metrics
  const performanceScore = calculatePerformanceScore(
    pathEfficiency,
    solutionTime,
    hintsReliance,
    errorCorrection
  );
  const cognitiveEfficiency = calculateCognitiveEfficiency(
    solutionTime,
    actualPathLength,
    optimalPathLength
  );
  const learningRate = 0; // This requires multiple maze attempts - set default value
  const cognitiveStamina = calculateCognitiveStamina(moveTimes, timeElapsed);
  const compositeScore = calculateCompositeScore(
    pathEfficiency,
    explorationCoverage,
    decisionConsistency,
    performanceScore
  );

  return {
    spatialNavigation: {
      pathEfficiency,
      explorationCoverage,
      spatialMemory,
      wayfindingPrecision,
      routePlanning
    },
    decisionMaking: {
      decisionSpeed,
      decisionConsistency,
      explorationStrategy,
      adaptiveDecisionMaking,
      confidenceLevel
    },
    problemSolving: {
      solutionTime,
      hintsReliance,
      errorCorrection,
      obstacleManagement,
      solutionOptimality
    },
    attention: {
      focusMaintenance,
      distractionResistance,
      attentionalStamina,
      vigilanceLevel,
      attentionalLapses
    },
    overall: {
      performanceScore,
      cognitiveEfficiency,
      learningRate,
      cognitiveStamina,
      compositeScore
    }
  };
};

/**
 * Calculates the path efficiency (ratio of optimal to actual path)
 */
const calculatePathEfficiency = (optimalPathLength: number, actualPathLength: number): number => {
  if (actualPathLength === 0) return 0;
  return Math.min(100, (optimalPathLength / actualPathLength) * 100);
};

/**
 * Calculates the exploration coverage (percentage of maze explored)
 */
const calculateExplorationCoverage = (cellsVisited: number, totalCells: number): number => {
  if (totalCells === 0) return 0;
  return (cellsVisited / totalCells) * 100;
};

/**
 * Calculates spatial memory (ability to avoid revisiting cells)
 */
const calculateSpatialMemory = (revisitedCells: number, actualPathLength: number): number => {
  if (actualPathLength === 0) return 0;
  return Math.max(0, 100 - ((revisitedCells / actualPathLength) * 100));
};

/**
 * Calculates wayfinding precision (avoiding walls)
 */
const calculateWayfindingPrecision = (wallCollisions: number, actualPathLength: number): number => {
  if (actualPathLength === 0) return 0;
  return Math.max(0, 100 - ((wallCollisions / actualPathLength) * 100));
};

/**
 * Calculates route planning ability based on path characteristics
 */
const calculateRoutePlanning = (
  path: Maze2DGameState['path'],
  optimalPathLength: number,
  actualPathLength: number
): number => {
  // Analyze directional changes, backtracking, and overall strategy
  if (actualPathLength === 0 || path.length < 2) return 0;
  
  // Calculate directional consistency (fewer changes = better planning)
  let directionChanges = 0;
  for (let i = 2; i < path.length; i++) {
    const prevDirection = {
      x: path[i-1].x - path[i-2].x,
      y: path[i-1].y - path[i-2].y
    };
    const currentDirection = {
      x: path[i].x - path[i-1].x,
      y: path[i].y - path[i-1].y
    };
    
    if (prevDirection.x !== currentDirection.x || prevDirection.y !== currentDirection.y) {
      directionChanges++;
    }
  }
  
  const directionChangeRatio = directionChanges / actualPathLength;
  const pathEfficiency = optimalPathLength / actualPathLength;
  
  // Combine metrics (lower direction changes and higher efficiency = better planning)
  return Math.min(100, (pathEfficiency * 50) + ((1 - directionChangeRatio) * 50));
};

/**
 * Calculates average decision speed at junctions
 */
const calculateDecisionSpeed = (decisionPointTimes: number[]): number => {
  if (decisionPointTimes.length === 0) return 0;
  const avgTime = calculateMean(decisionPointTimes);
  // Transform to a 0-100 scale where lower time = higher score
  // Assuming average good decision time is 2000ms, scale accordingly
  return Math.max(0, 100 - (avgTime / 20));
};

/**
 * Calculates decision consistency (variance in decision times)
 */
const calculateDecisionConsistency = (decisionPointTimes: number[]): number => {
  if (decisionPointTimes.length < 2) return 0;
  const stdDev = calculateStandardDeviation(decisionPointTimes);
  const mean = calculateMean(decisionPointTimes);
  // Lower coefficient of variation = higher consistency
  return Math.max(0, 100 - ((stdDev / mean) * 100));
};

/**
 * Calculates evidence of systematic exploration strategy
 */
const calculateExplorationStrategy = (
  path: Maze2DGameState['path'],
  cellsVisited: number,
  totalCells: number
): number => {
  if (path.length < 2 || totalCells === 0) return 0;
  
  // Look for patterns like wall-following, breadth-first, depth-first
  // Higher coverage with fewer revisits indicates better strategy
  const explorationRatio = cellsVisited / totalCells;
  const patternScore = detectMovementPattern(path);
  
  return Math.min(100, (explorationRatio * 50) + (patternScore * 50));
};

/**
 * Helper function to detect movement patterns
 */
const detectMovementPattern = (path: Maze2DGameState['path']): number => {
  // Simplified implementation - would be more complex in full version
  if (path.length < 10) return 0.5; // Not enough data
  
  // Look for consistent patterns like wall-following or systematic search
  // For this simplified version, return a placeholder value
  return 0.7; // 0-1 score of pattern detection
};

/**
 * Calculates adaptive decision making (adjusting after errors)
 */
const calculateAdaptiveDecisionMaking = (
  path: Maze2DGameState['path'],
  wallCollisions: number
): number => {
  if (path.length < 3) return 0;
  
  // Calculate how quickly player adapts after making errors
  const adaptabilityScore = Math.max(0, 100 - (wallCollisions * 5));
  
  // Would analyze post-error behavior in a more sophisticated implementation
  return adaptabilityScore;
};

/**
 * Calculates confidence in navigation decisions
 */
const calculateConfidenceLevel = (moveTimes: number[], hintsUsed: number): number => {
  if (moveTimes.length === 0) return 0;
  
  // Calculate decision hesitation (variance in movement times)
  const meanTime = calculateMean(moveTimes);
  const stdDev = calculateStandardDeviation(moveTimes);
  const hesitationScore = Math.max(0, 100 - ((stdDev / meanTime) * 100));
  
  // Adjust for hint usage (more hints = less confidence)
  const hintPenalty = hintsUsed * 5;
  
  return Math.max(0, hesitationScore - hintPenalty);
};

/**
 * Calculates reliance on hints
 */
const calculateHintsReliance = (hintsUsed: number, difficulty: number): number => {
  // Scale based on difficulty (more hints allowed at higher difficulties)
  const difficultyFactor = difficulty / 10; // Assuming difficulty is 1-10
  const maxAllowedHints = Math.ceil(5 * difficultyFactor);
  
  // Lower score = more reliance (worse)
  return Math.max(0, 100 - ((hintsUsed / maxAllowedHints) * 100));
};

/**
 * Calculates error correction ability
 */
const calculateErrorCorrection = (wallCollisions: number, path: Maze2DGameState['path']): number => {
  if (path.length === 0) return 0;
  
  // Lower collision to path ratio = better error correction
  return Math.max(0, 100 - ((wallCollisions / path.length) * 100));
};

/**
 * Calculates efficiency in handling obstacles
 */
const calculateObstacleManagement = (
  path: Maze2DGameState['path'],
  wallCollisions: number
): number => {
  if (path.length === 0) return 0;
  
  // Fewer collisions relative to path length = better obstacle management
  const collisionRatio = wallCollisions / path.length;
  return Math.max(0, 100 - (collisionRatio * 200)); // Steeper penalty for collisions
};

/**
 * Calculates how close to optimal the solution was
 */
const calculateSolutionOptimality = (
  optimalPathLength: number,
  actualPathLength: number,
  completed: boolean
): number => {
  if (!completed || actualPathLength === 0) return 0;
  
  // Direct ratio of optimal to actual path, scaled to percentage
  return Math.min(100, (optimalPathLength / actualPathLength) * 100);
};

/**
 * Calculates consistency in movement and decision speed
 */
const calculateFocusMaintenance = (moveTimes: number[]): number => {
  if (moveTimes.length < 2) return 0;
  
  // Lower variance in movement times indicates better focus
  const stdDev = calculateStandardDeviation(moveTimes);
  const mean = calculateMean(moveTimes);
  
  return Math.max(0, 100 - ((stdDev / mean) * 100));
};

/**
 * Calculates ability to stay on task without wandering
 */
const calculateDistractionResistance = (revisitedCells: number, cellsVisited: number): number => {
  if (cellsVisited === 0) return 0;
  
  // Fewer revisits relative to total cells visited = better focus
  return Math.max(0, 100 - ((revisitedCells / cellsVisited) * 100));
};

/**
 * Calculates maintenance of focus throughout the task
 */
const calculateAttentionalStamina = (
  path: Maze2DGameState['path'],
  timeElapsed: number
): number => {
  if (path.length < 10 || timeElapsed === 0) return 0;
  
  // Analyze movement consistency over time
  // Divide path into quarters and compare movement patterns
  const quarters = [
    path.slice(0, path.length / 4),
    path.slice(path.length / 4, path.length / 2),
    path.slice(path.length / 2, 3 * path.length / 4),
    path.slice(3 * path.length / 4)
  ];
  
  // Calculate average time per move in each quarter
  const quarterTimes = quarters.map(quarter => {
    if (quarter.length < 2) return 0;
    return (quarter[quarter.length - 1].timestamp - quarter[0].timestamp) / quarter.length;
  });
  
  // Look for significant slowdowns in later quarters (indicating fatigue)
  if (quarterTimes[0] === 0) return 50; // Not enough data
  
  const fatigueRatio = quarterTimes[3] / quarterTimes[0];
  return Math.max(0, 100 - ((fatigueRatio - 1) * 50)); // Penalize slowdowns
};

/**
 * Calculates awareness of surroundings and opportunities
 */
const calculateVigilanceLevel = (wallCollisions: number, actualPathLength: number): number => {
  if (actualPathLength === 0) return 0;
  
  // Fewer collisions relative to path length = better vigilance
  return Math.max(0, 100 - ((wallCollisions / actualPathLength) * 200));
};

/**
 * Calculates number of apparent attention failures
 */
const calculateAttentionalLapses = (moveTimes: number[]): number => {
  if (moveTimes.length === 0) return 0;
  
  // Count unusually long pauses as attentional lapses
  const mean = calculateMean(moveTimes);
  const stdDev = calculateStandardDeviation(moveTimes);
  const threshold = mean + (2.5 * stdDev); // Values more than 2.5 SD above mean
  
  // Count number of values above threshold
  return moveTimes.filter(time => time > threshold).length;
};

/**
 * Calculates overall maze performance score
 */
const calculatePerformanceScore = (
  pathEfficiency: number,
  solutionTime: number,
  hintsReliance: number,
  errorCorrection: number
): number => {
  // Weighted combination of key metrics
  return (
    (pathEfficiency * 0.4) +
    (Math.min(100, 10000 / solutionTime) * 0.3) + // Lower time = higher score
    (hintsReliance * 0.1) +
    (errorCorrection * 0.2)
  );
};

/**
 * Calculates balance of speed and accuracy
 */
const calculateCognitiveEfficiency = (
  solutionTime: number,
  actualPathLength: number,
  optimalPathLength: number
): number => {
  if (actualPathLength === 0) return 0;
  
  // Efficiency is a balance between speed and accuracy
  const pathRatio = optimalPathLength / actualPathLength;
  const timeScore = Math.min(100, 10000 / solutionTime); // Lower time = higher score
  
  return (pathRatio * 50) + (timeScore * 0.5);
};

/**
 * Calculates resistance to cognitive fatigue
 */
const calculateCognitiveStamina = (moveTimes: number[], timeElapsed: number): number => {
  if (moveTimes.length < 10 || timeElapsed === 0) return 0;
  
  // Divide move times into halves and compare performance
  const halfLength = Math.floor(moveTimes.length / 2);
  const firstHalf = moveTimes.slice(0, halfLength);
  const secondHalf = moveTimes.slice(halfLength);
  
  const firstHalfMean = calculateMean(firstHalf);
  const secondHalfMean = calculateMean(secondHalf);
  
  // Check for slowdown in second half (indicates fatigue)
  const fatigueRatio = secondHalfMean / firstHalfMean;
  
  return Math.max(0, 100 - ((fatigueRatio - 1) * 50));
};

/**
 * Calculates overall cognitive ability score
 */
const calculateCompositeScore = (
  pathEfficiency: number,
  explorationCoverage: number,
  decisionConsistency: number,
  performanceScore: number
): number => {
  // Weighted combination of all major metrics
  return (
    (pathEfficiency * 0.25) +
    (explorationCoverage * 0.25) +
    (decisionConsistency * 0.25) +
    (performanceScore * 0.25)
  );
}; 