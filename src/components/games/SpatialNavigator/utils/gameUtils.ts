import { Rotation } from '../types';

export const generateRandomRotation = (): Rotation => {
  return [
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  ];
};

export const calculateScore = (level: number, timeTaken: number, attempts: number): number => {
  // Base score for completing the level
  const baseScore = 1000 * level;
  
  // Time bonus (max 500 points, decreases as time increases)
  const timeBonus = Math.max(0, 500 - Math.floor(timeTaken * 10));
  
  // Penalty for multiple attempts (100 points per extra attempt)
  const attemptPenalty = Math.max(0, (attempts - 1) * 100);
  
  return Math.max(0, baseScore + timeBonus - attemptPenalty);
}; 