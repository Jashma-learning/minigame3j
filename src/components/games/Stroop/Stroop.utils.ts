import { StroopMetrics, StroopGameState } from '../../../types/cognitive/stroop.types';

// Statistical helper functions
const calculateMean = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
};

const calculateStandardDeviation = (numbers: number[]): number => {
  if (numbers.length < 2) return 0;
  const mean = calculateMean(numbers);
  const squareDiffs = numbers.map(n => Math.pow(n - mean, 2));
  const variance = calculateMean(squareDiffs);
  return Math.sqrt(variance);
};

export const calculateStroopMetrics = (gameState: StroopGameState): StroopMetrics => {
  const { responses, totalRounds, currentDifficulty, streak } = gameState;

  // Separate congruent and incongruent responses
  const congruentResponses = responses.filter(r => r.stimulusType === 'congruent');
  const incongruentResponses = responses.filter(r => r.stimulusType === 'incongruent');

  // Calculate inhibition metrics
  const inhibition = {
    accuracy: (responses.filter(r => r.wasCorrect).length / responses.length) * 100,
    interference: (incongruentResponses.filter(r => !r.wasCorrect).length / incongruentResponses.length) * 100,
    congruentAccuracy: (congruentResponses.filter(r => r.wasCorrect).length / congruentResponses.length) * 100,
    incongruentAccuracy: (incongruentResponses.filter(r => r.wasCorrect).length / incongruentResponses.length) * 100,
    interferenceEffect: calculateInterferenceEffect(congruentResponses, incongruentResponses)
  };

  // Calculate attention metrics
  const reactionTimes = responses.map(r => r.responseTime);
  const meanRT = calculateMean(reactionTimes);
  const verySlowThreshold = meanRT * 2; // Responses twice as slow as mean
  
  const attention = {
    sustainedAttention: calculateSustainedAttention(responses),
    vigilanceLevel: calculateVigilanceLevel(responses),
    attentionalLapses: responses.filter(r => r.responseTime > verySlowThreshold).length,
    focusQuality: calculateFocusQuality(responses)
  };

  // Calculate processing metrics
  const correctCongruentRT = congruentResponses
    .filter(r => r.wasCorrect)
    .map(r => r.responseTime);
    
  const correctIncongruentRT = incongruentResponses
    .filter(r => r.wasCorrect)
    .map(r => r.responseTime);

  const processing = {
    averageReactionTime: calculateMean(reactionTimes),
    congruentReactionTime: calculateMean(correctCongruentRT),
    incongruentReactionTime: calculateMean(correctIncongruentRT),
    reactionTimeVariability: calculateStandardDeviation(reactionTimes),
    processingEfficiency: calculateProcessingEfficiency(responses)
  };

  // Calculate flexibility metrics
  const flexibility = {
    adaptiveControl: calculateAdaptiveControl(responses, currentDifficulty),
    switchingCost: calculateSwitchingCost(responses),
    errorRecovery: calculateErrorRecovery(responses),
    strategyDevelopment: calculateStrategyDevelopment(responses, streak)
  };

  // Calculate overall metrics
  const overall = {
    performanceScore: calculateOverallPerformance(inhibition, attention, processing),
    cognitiveFatigue: calculateCognitiveFatigue(responses),
    consistencyIndex: calculateConsistencyIndex(responses),
    compositeScore: calculateCompositeScore(inhibition, attention, processing, flexibility)
  };

  return {
    inhibition,
    attention,
    processing,
    flexibility,
    overall
  };
};

// Helper calculation functions
const calculateInterferenceEffect = (
  congruentResponses: StroopGameState['responses'], 
  incongruentResponses: StroopGameState['responses']
): number => {
  const correctCongruentRT = congruentResponses
    .filter(r => r.wasCorrect)
    .map(r => r.responseTime);
    
  const correctIncongruentRT = incongruentResponses
    .filter(r => r.wasCorrect)
    .map(r => r.responseTime);
  
  return calculateMean(correctIncongruentRT) - calculateMean(correctCongruentRT);
};

const calculateSustainedAttention = (responses: StroopGameState['responses']): number => {
  if (responses.length < 4) return 100;
  
  // Split responses into quarters and compare performance
  const quarters = Math.floor(responses.length / 4);
  const firstQuarter = responses.slice(0, quarters);
  const lastQuarter = responses.slice(-quarters);
  
  const firstAccuracy = firstQuarter.filter(r => r.wasCorrect).length / firstQuarter.length;
  const lastAccuracy = lastQuarter.filter(r => r.wasCorrect).length / lastQuarter.length;
  
  // Score based on maintained or improved accuracy
  return Math.min(100, Math.max(0, ((lastAccuracy / Math.max(firstAccuracy, 0.01)) * 100)));
};

const calculateVigilanceLevel = (responses: StroopGameState['responses']): number => {
  if (responses.length === 0) return 0;
  
  // Calculate average response time for correct responses
  const correctResponses = responses.filter(r => r.wasCorrect);
  const avgRT = calculateMean(correctResponses.map(r => r.responseTime));
  
  // Higher score for faster average response times (up to a point)
  const optimalRT = 500; // milliseconds
  const maxRT = 1500; // milliseconds
  
  return Math.max(0, Math.min(100, 
    100 - ((avgRT - optimalRT) / (maxRT - optimalRT)) * 100
  ));
};

const calculateFocusQuality = (responses: StroopGameState['responses']): number => {
  if (responses.length < 2) return 100;
  
  // Calculate consistency in response patterns
  const responseTimes = responses.map(r => r.responseTime);
  const variability = calculateStandardDeviation(responseTimes) / calculateMean(responseTimes);
  
  // Lower variability = higher focus quality
  return Math.max(0, Math.min(100, 100 - (variability * 100)));
};

const calculateProcessingEfficiency = (responses: StroopGameState['responses']): number => {
  if (responses.length === 0) return 0;
  
  const correctResponses = responses.filter(r => r.wasCorrect);
  const accuracy = correctResponses.length / responses.length;
  const avgSpeed = calculateMean(correctResponses.map(r => r.responseTime));
  
  // Combine speed and accuracy into efficiency score (higher is better)
  const speedScore = Math.max(0, Math.min(100, 100 - (avgSpeed / 20)));
  return Math.max(0, (accuracy * 70 + speedScore * 30));
};

const calculateAdaptiveControl = (
  responses: StroopGameState['responses'],
  currentDifficulty: number
): number => {
  if (responses.length < 5) return 50;
  
  // Check if performance improves as difficulty increases
  const difficultyToPerformanceRatio = currentDifficulty / Math.max(1, 
    responses.slice(-5).filter(r => r.wasCorrect).length / 5
  );
  
  return Math.max(0, Math.min(100, 100 - (difficultyToPerformanceRatio * 10)));
};

const calculateSwitchingCost = (responses: StroopGameState['responses']): number => {
  if (responses.length < 3) return 0;
  
  const switchCosts: number[] = [];
  
  // Calculate the cost of switching between congruent and incongruent trials
  for (let i = 1; i < responses.length; i++) {
    const prev = responses[i - 1];
    const curr = responses[i];
    
    if (prev.stimulusType !== curr.stimulusType) {
      // This is a switch trial
      const similarTrials = responses.filter(r => 
        r.stimulusType === curr.stimulusType && r.wasCorrect
      );
      
      const avgSimilarRT = calculateMean(similarTrials.map(r => r.responseTime));
      const switchCost = curr.responseTime - avgSimilarRT;
      
      if (switchCost > 0 && curr.wasCorrect) {
        switchCosts.push(switchCost);
      }
    }
  }
  
  // Higher switch cost means lower score
  const avgSwitchCost = calculateMean(switchCosts);
  return Math.max(0, Math.min(100, 100 - (avgSwitchCost / 5)));
};

const calculateErrorRecovery = (responses: StroopGameState['responses']): number => {
  if (responses.length < 2) return 100;
  
  const postErrorRTs: number[] = [];
  
  // Find RTs after errors
  for (let i = 1; i < responses.length; i++) {
    if (!responses[i-1].wasCorrect && responses[i].wasCorrect) {
      postErrorRTs.push(responses[i].responseTime);
    }
  }
  
  if (postErrorRTs.length === 0) return 100; // No errors to recover from
  
  // Calculate how much slower post-error responses are
  const correctRTs = responses.filter(r => r.wasCorrect).map(r => r.responseTime);
  const avgCorrectRT = calculateMean(correctRTs);
  const avgPostErrorRT = calculateMean(postErrorRTs);
  
  const recoveryRatio = avgCorrectRT / avgPostErrorRT;
  return Math.max(0, Math.min(100, recoveryRatio * 100));
};

const calculateStrategyDevelopment = (
  responses: StroopGameState['responses'],
  streak: number
): number => {
  if (responses.length < 8) return 50;
  
  // Divide responses into first half and second half
  const midpoint = Math.floor(responses.length / 2);
  const firstHalf = responses.slice(0, midpoint);
  const secondHalf = responses.slice(midpoint);
  
  // Calculate improvements in accuracy and reaction time
  const firstHalfAccuracy = firstHalf.filter(r => r.wasCorrect).length / firstHalf.length;
  const secondHalfAccuracy = secondHalf.filter(r => r.wasCorrect).length / secondHalf.length;
  
  const firstHalfRT = calculateMean(firstHalf.map(r => r.responseTime));
  const secondHalfRT = calculateMean(secondHalf.map(r => r.responseTime));
  
  const accuracyImprovement = (secondHalfAccuracy - firstHalfAccuracy) * 100;
  const speedImprovement = Math.max(0, firstHalfRT - secondHalfRT);
  
  // Factor in current streak for bonus points
  const streakBonus = Math.min(25, streak);
  
  return Math.max(0, Math.min(100, 
    50 + accuracyImprovement + (speedImprovement / 10) + streakBonus
  ));
};

const calculateCognitiveFatigue = (responses: StroopGameState['responses']): number => {
  if (responses.length < 8) return 0;
  
  // Divide responses into quarters
  const chunkSize = Math.floor(responses.length / 4);
  const firstQuarter = responses.slice(0, chunkSize);
  const lastQuarter = responses.slice(-chunkSize);
  
  // Check for increased reaction times and decreased accuracy
  const firstQuarterRT = calculateMean(firstQuarter.map(r => r.responseTime));
  const lastQuarterRT = calculateMean(lastQuarter.map(r => r.responseTime));
  
  const firstQuarterAcc = firstQuarter.filter(r => r.wasCorrect).length / firstQuarter.length;
  const lastQuarterAcc = lastQuarter.filter(r => r.wasCorrect).length / lastQuarter.length;
  
  const rtIncrease = Math.max(0, (lastQuarterRT - firstQuarterRT) / firstQuarterRT) * 100;
  const accDecrease = Math.max(0, (firstQuarterAcc - lastQuarterAcc)) * 100;
  
  return Math.min(100, rtIncrease * 0.5 + accDecrease * 0.5);
};

const calculateConsistencyIndex = (responses: StroopGameState['responses']): number => {
  if (responses.length < 4) return 100;
  
  // Calculate consistency in response times and accuracy
  const rtConsistency = 1 - (
    calculateStandardDeviation(responses.map(r => r.responseTime)) /
    calculateMean(responses.map(r => r.responseTime))
  );
  
  // Calculate consistency in accuracy over time
  const windowSize = 4;
  const accuracies: number[] = [];
  for (let i = 0; i <= responses.length - windowSize; i++) {
    const window = responses.slice(i, i + windowSize);
    accuracies.push(window.filter(r => r.wasCorrect).length / windowSize);
  }
  const accuracyConsistency = 1 - calculateStandardDeviation(accuracies);
  
  return Math.max(0, Math.min(100, 
    (rtConsistency * 50 + accuracyConsistency * 50) * 100
  ));
};

const calculateOverallPerformance = (
  inhibition: StroopMetrics['inhibition'],
  attention: StroopMetrics['attention'],
  processing: StroopMetrics['processing']
): number => {
  return Math.min(100, (
    inhibition.accuracy * 0.4 +
    attention.sustainedAttention * 0.3 +
    processing.processingEfficiency * 0.3
  ));
};

const calculateCompositeScore = (
  inhibition: StroopMetrics['inhibition'],
  attention: StroopMetrics['attention'],
  processing: StroopMetrics['processing'],
  flexibility: StroopMetrics['flexibility']
): number => {
  // Weighted combination of all major components
  return Math.min(100, (
    inhibition.accuracy * 0.25 +
    attention.sustainedAttention * 0.25 +
    processing.processingEfficiency * 0.25 +
    flexibility.adaptiveControl * 0.25
  ));
}; 