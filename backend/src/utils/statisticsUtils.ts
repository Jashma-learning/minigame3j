/**
 * Calculates the percentile ranking for a score on a 0-100 scale
 * This is a simplified implementation for demonstration purposes
 * 
 * @param score - The score to calculate percentile for (0-100)
 * @returns Percentile ranking between 0-100
 */
export const calculatePercentileRanking = (score: number): number => {
  // In a real-world implementation, this would compare the score against
  // a distribution of scores from other users. For now, we'll use a simplified
  // bell curve approximation centered at 50.
  
  if (score <= 0) return 0;
  if (score >= 100) return 100;
  
  // For scores 0-100, apply a bell curve transformation
  // This makes scores near the middle (50) correspond to the 50th percentile
  // and scores further from the middle become more extreme in percentile
  
  const normalizedScore = score / 100;
  
  // Simplified bell curve transformation
  // This approximates a normal distribution
  if (normalizedScore <= 0.5) {
    // Lower half of the bell curve
    return normalizedScore * 2 * 50; // 0-50 percentile
  } else {
    // Upper half of the bell curve
    return 50 + ((normalizedScore - 0.5) * 2 * 50); // 50-100 percentile
  }
};

/**
 * Calculates the mean of an array of numbers
 * 
 * @param values - Array of numbers
 * @returns The mean (average) of the values
 */
export const calculateMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

/**
 * Calculates the standard deviation of an array of numbers
 * 
 * @param values - Array of numbers
 * @returns The standard deviation of the values
 */
export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length <= 1) return 0;
  
  const mean = calculateMean(values);
  const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
  const variance = calculateMean(squaredDifferences);
  
  return Math.sqrt(variance);
};

/**
 * Calculates the median of an array of numbers
 * 
 * @param values - Array of numbers
 * @returns The median value
 */
export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    // Even number of elements - average the two middle values
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    // Odd number of elements - return the middle value
    return sorted[middle];
  }
};

/**
 * Calculates a z-score (standard score) for a value
 * 
 * @param value - The value to calculate z-score for
 * @param mean - The mean of the distribution
 * @param stdDev - The standard deviation of the distribution
 * @returns The z-score
 */
export const calculateZScore = (value: number, mean: number, stdDev: number): number => {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
};

/**
 * Converts a z-score to a percentile (using the normal distribution)
 * 
 * @param zScore - The z-score to convert
 * @returns The corresponding percentile (0-100)
 */
export const zScoreToPercentile = (zScore: number): number => {
  // This is an approximation of the cumulative distribution function
  // for the standard normal distribution
  
  // Ensure z-score is within reasonable bounds
  const z = Math.max(-4, Math.min(4, zScore));
  
  // Constants for the approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  // Symmetry of the distribution
  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z);
  
  // Approximation formula
  const t = 1.0 / (1.0 + p * absZ);
  const erf = 1.0 - (a1 * t + a2 * t * t + a3 * t * t * t + a4 * t * t * t * t + a5 * t * t * t * t * t) * Math.exp(-absZ * absZ);
  
  // Convert to percentile
  const percentile = 50 * (1 + sign * erf);
  
  return percentile;
};

 