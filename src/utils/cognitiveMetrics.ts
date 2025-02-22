import { GameMetrics, GameObject } from '@/types/game';

interface CognitiveIndices {
  smi: number;   // Spatial Memory Index
  psi: number;   // Processing Speed Index
  asi: number;   // Attention Span Index
  dri: number;   // Distraction Resistance Index
  seqi: number;  // Sequential Memory Index
  ocps: number;  // Overall Cognitive Performance Score
}

export function calculateCognitiveIndices(
  metrics: GameMetrics,
  originalObjects: GameObject[],
  gridSize: number
): CognitiveIndices {
  // Calculate Spatial Memory Index (SMI)
  const coordinateAccuracy = metrics.accuracy / 100;
  const maxDistance = Math.sqrt(2 * Math.pow(gridSize - 1, 2)); // Maximum possible distance in grid
  const averageDisplacement = metrics.objectPlacements.reduce((sum, placement) => {
    const dx = placement.placedPosition[0] - placement.originalPosition[0];
    const dy = placement.placedPosition[1] - placement.originalPosition[1];
    return sum + Math.sqrt(dx * dx + dy * dy);
  }, 0) / metrics.objectPlacements.length;
  const positionDistance = 1 - (averageDisplacement / maxDistance);
  const smi = (coordinateAccuracy * 0.6) + (positionDistance * 0.4);

  // Calculate Processing Speed Index (PSI)
  const MTR = 30000; // 30 seconds in milliseconds
  const MHT = 10000; // 10 seconds in milliseconds
  const recallTimeFactor = 1 - (metrics.recallTime / MTR);
  const hesitationTimeFactor = 1 - (metrics.hesitationTime / MHT);
  const psi = 100 * Math.max(0, recallTimeFactor) * Math.max(0, hesitationTimeFactor);

  // Calculate Attention Span Index (ASI)
  const explorationTimeUtilization = metrics.explorationTime / 5; // 5 seconds total
  const incorrectPlacements = metrics.objectPlacements.filter(p => !p.isCorrect).length;
  const focusConsistency = 1 - (incorrectPlacements / metrics.objectPlacements.length);
  const asi = (explorationTimeUtilization * 0.4) + (focusConsistency * 0.6);

  // Calculate Distraction Resistance Index (DRI)
  const maxDistractionScore = 10;
  const distractionScore = metrics.distractionScore / maxDistractionScore;
  const memoryPreservation = metrics.objectPlacements.filter(p => p.isCorrect).length / originalObjects.length;
  const dri = (distractionScore * 0.5) + (memoryPreservation * 0.5);

  // Calculate Sequential Memory Index (SEQI)
  const placementTimes = metrics.objectPlacements.map(p => p.timeTaken);
  const meanTime = placementTimes.reduce((a, b) => a + b, 0) / placementTimes.length;
  const stdDev = Math.sqrt(
    placementTimes.reduce((sq, n) => sq + Math.pow(n - meanTime, 2), 0) / placementTimes.length
  );
  const timePattern = 1 - (stdDev / meanTime);
  const orderAccuracy = metrics.objectPlacements.filter(p => p.isCorrect).length / originalObjects.length;
  const seqi = (orderAccuracy * 0.7) + (Math.max(0, timePattern) * 0.3);

  // Calculate Overall Cognitive Performance Score (OCPS)
  const ocps = (
    (smi * 0.25) +
    (psi * 0.20) +
    (asi * 0.20) +
    (dri * 0.15) +
    (seqi * 0.20)
  ) * 100;

  return {
    smi: smi * 100,
    psi,
    asi: asi * 100,
    dri: dri * 100,
    seqi: seqi * 100,
    ocps
  };
}

export function calculateDifficultyParameters(level: number) {
  return {
    gridSize: 5 + Math.floor(level / 3),
    objectCount: 3 + Math.floor(level / 3),
    memorizationTime: Math.max(2, 5 - Math.floor(level / 3)),
    distractionComplexity: 1 + (level * 0.2)
  };
}

export function checkLevelAdvancement(
  indices: CognitiveIndices,
  attempts: number,
  previousScores: number[]
): boolean {
  if (attempts < 3) return false;

  // Check if all indices are above their thresholds
  if (
    indices.smi <= 75 ||
    indices.psi <= 70 ||
    indices.asi <= 80 ||
    indices.dri <= 65 ||
    indices.seqi <= 70 ||
    indices.ocps <= 75
  ) {
    return false;
  }

  // Check performance consistency
  if (previousScores.length >= 3) {
    const mean = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;
    const stdDev = Math.sqrt(
      previousScores.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / previousScores.length
    );
    const coefficientOfVariation = (stdDev / mean) * 100;
    if (coefficientOfVariation >= 15) return false;
  }

  return true;
} 