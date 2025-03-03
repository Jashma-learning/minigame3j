import { GoNoGoGameState, GoNoGoMetrics } from '../../../types/cognitive/goNoGo.types';

// Statistical helper functions
const calculateMean = (numbers: number[]): number => 
  numbers.length > 0 ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0;

const calculateStandardDeviation = (numbers: number[]): number => {
  if (numbers.length < 2) return 0;
  const mean = calculateMean(numbers);
  const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
  return Math.sqrt(variance);
};

// Calculate trend from a series of numbers (-100 to 100)
const calculateTrend = (numbers: number[]): number => {
  if (numbers.length < 2) return 0;
  const first = numbers[0];
  const last = numbers[numbers.length - 1];
  const maxChange = Math.max(Math.abs(first), 100);
  return ((last - first) / maxChange) * 100;
};

export const calculateGoNoGoMetrics = (gameState: GoNoGoGameState): GoNoGoMetrics => {
  const { responses, totalRounds, currentSpeed, streak } = gameState;

  // Separate Go and No-Go responses
  const goResponses = responses.filter(r => r.stimulusType === 'go');
  const noGoResponses = responses.filter(r => r.stimulusType === 'no-go');

  // Calculate inhibition metrics
  const inhibition = {
    accuracy: (responses.filter(r => r.wasCorrect).length / responses.length) * 100,
    noGoAccuracy: (noGoResponses.filter(r => r.wasCorrect).length / noGoResponses.length) * 100,
    goAccuracy: (goResponses.filter(r => r.wasCorrect).length / goResponses.length) * 100,
    falseAlarms: noGoResponses.filter(r => !r.wasCorrect).length,
    missedGoes: goResponses.filter(r => !r.wasCorrect).length
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
  const correctGoRT = goResponses
    .filter(r => r.wasCorrect)
    .map(r => r.responseTime);

  const processing = {
    averageReactionTime: calculateMean(correctGoRT),
    reactionTimeVariability: calculateStandardDeviation(correctGoRT),
    processingEfficiency: calculateProcessingEfficiency(responses),
    adaptiveControl: calculateAdaptiveControl(responses)
  };

  // Calculate learning metrics
  const learning = {
    learningRate: calculateLearningRate(responses),
    errorCorrectionSpeed: calculateErrorCorrectionSpeed(responses),
    adaptationQuality: calculateAdaptationQuality(responses, currentSpeed),
    performanceStability: calculatePerformanceStability(responses)
  };

  // Calculate overall metrics
  const overall = {
    performanceScore: calculateOverallPerformance(inhibition, attention, processing),
    cognitiveFatigue: calculateCognitiveFatigue(responses),
    consistencyIndex: calculateConsistencyIndex(responses),
    compositeScore: calculateCompositeScore(inhibition, attention, processing, learning)
  };

  return {
    inhibition,
    attention,
    processing,
    learning,
    overall
  };
};

// Helper calculation functions
const calculateSustainedAttention = (responses: GoNoGoGameState['responses']): number => {
  if (responses.length < 4) return 100;
  
  // Split responses into quarters and compare performance
  const quarters = Math.floor(responses.length / 4);
  const firstQuarter = responses.slice(0, quarters);
  const lastQuarter = responses.slice(-quarters);
  
  const firstAccuracy = firstQuarter.filter(r => r.wasCorrect).length / firstQuarter.length;
  const lastAccuracy = lastQuarter.filter(r => r.wasCorrect).length / lastQuarter.length;
  
  // Score based on maintained or improved accuracy
  return Math.min(100, ((lastAccuracy / firstAccuracy) * 100));
};

const calculateVigilanceLevel = (responses: GoNoGoGameState['responses']): number => {
  if (responses.length === 0) return 0;
  
  // Calculate average response time for correct responses
  const correctResponses = responses.filter(r => r.wasCorrect);
  const avgRT = calculateMean(correctResponses.map(r => r.responseTime));
  
  // Higher score for faster average response times (up to a point)
  const optimalRT = 300; // milliseconds
  const maxRT = 1000; // milliseconds
  
  return Math.max(0, Math.min(100, 
    100 - ((avgRT - optimalRT) / (maxRT - optimalRT)) * 100
  ));
};

const calculateFocusQuality = (responses: GoNoGoGameState['responses']): number => {
  if (responses.length < 2) return 100;
  
  // Calculate consistency in response patterns
  const responseTimes = responses.map(r => r.responseTime);
  const variability = calculateStandardDeviation(responseTimes) / calculateMean(responseTimes);
  
  // Lower variability = higher focus quality
  return Math.max(0, Math.min(100, 100 - (variability * 100)));
};

const calculateProcessingEfficiency = (responses: GoNoGoGameState['responses']): number => {
  if (responses.length === 0) return 0;
  
  const correctResponses = responses.filter(r => r.wasCorrect);
  const accuracy = correctResponses.length / responses.length;
  const avgSpeed = calculateMean(correctResponses.map(r => r.responseTime));
  
  // Combine speed and accuracy into efficiency score
  const speedScore = Math.max(0, Math.min(100, 100 - (avgSpeed / 10)));
  return (accuracy * 60 + speedScore * 40);
};

const calculateAdaptiveControl = (responses: GoNoGoGameState['responses']): number => {
  if (responses.length < 4) return 100;
  
  // Calculate improvement in response to speed changes
  const speedChanges = responses.slice(1).map((r, i) => ({
    speedDiff: r.speed - responses[i].speed,
    performanceChange: Number(r.wasCorrect) - Number(responses[i].wasCorrect)
  }));
  
  const adaptationScore = speedChanges.reduce((score, change) => {
    if (change.speedDiff < 0) { // Game got faster
      return score + (change.performanceChange >= 0 ? 1 : -1);
    }
    return score;
  }, 0);
  
  return Math.max(0, Math.min(100, 50 + (adaptationScore * 10)));
};

const calculateLearningRate = (responses: GoNoGoGameState['responses']): number => {
  if (responses.length < 4) return 0;
  
  // Split into quarters and compare performance
  const quarters = Math.floor(responses.length / 4);
  const performanceByQuarter = Array.from({ length: 4 }, (_, i) => {
    const quarterResponses = responses.slice(i * quarters, (i + 1) * quarters);
    return quarterResponses.filter(r => r.wasCorrect).length / quarterResponses.length;
  });
  
  // Calculate trend in performance
  return Math.max(0, calculateTrend(performanceByQuarter));
};

const calculateErrorCorrectionSpeed = (responses: GoNoGoGameState['responses']): number => {
  if (responses.length < 2) return 100;
  
  // Find sequences of error -> correct response
  let totalCorrectionTime = 0;
  let corrections = 0;
  
  for (let i = 1; i < responses.length; i++) {
    if (!responses[i-1].wasCorrect && responses[i].wasCorrect) {
      totalCorrectionTime += responses[i].responseTime;
      corrections++;
    }
  }
  
  if (corrections === 0) return 100;
  const avgCorrectionTime = totalCorrectionTime / corrections;
  
  // Score based on correction speed (faster = better)
  return Math.max(0, Math.min(100, 100 - (avgCorrectionTime / 10)));
};

const calculateAdaptationQuality = (
  responses: GoNoGoGameState['responses'],
  currentSpeed: number
): number => {
  if (responses.length < 4) return 100;
  
  // Calculate how well performance is maintained as speed increases
  const initialSpeed = responses[0].speed;
  const speedReduction = initialSpeed - currentSpeed;
  const recentAccuracy = responses.slice(-4)
    .filter(r => r.wasCorrect).length / 4;
  
  return Math.max(0, Math.min(100,
    (recentAccuracy * 100) * (1 + speedReduction / initialSpeed)
  ));
};

const calculatePerformanceStability = (responses: GoNoGoGameState['responses']): number => {
  if (responses.length < 4) return 100;
  
  // Calculate rolling accuracy over windows of 4 responses
  const windowSize = 4;
  const accuracies: number[] = [];
  
  for (let i = 0; i <= responses.length - windowSize; i++) {
    const window = responses.slice(i, i + windowSize);
    accuracies.push(window.filter(r => r.wasCorrect).length / windowSize);
  }
  
  // Lower variance = higher stability
  const stability = 1 - calculateStandardDeviation(accuracies);
  return Math.max(0, Math.min(100, stability * 100));
};

const calculateOverallPerformance = (
  inhibition: GoNoGoMetrics['inhibition'],
  attention: GoNoGoMetrics['attention'],
  processing: GoNoGoMetrics['processing']
): number => {
  return Math.min(100, (
    inhibition.accuracy * 0.4 +
    attention.sustainedAttention * 0.3 +
    processing.processingEfficiency * 0.3
  ));
};

const calculateCognitiveFatigue = (responses: GoNoGoGameState['responses']): number => {
  if (responses.length < 8) return 0;
  
  // Compare performance in first and last quarter
  const quarter = Math.floor(responses.length / 4);
  const firstQuarter = responses.slice(0, quarter);
  const lastQuarter = responses.slice(-quarter);
  
  const firstPerf = {
    accuracy: firstQuarter.filter(r => r.wasCorrect).length / quarter,
    speed: calculateMean(firstQuarter.map(r => r.responseTime))
  };
  
  const lastPerf = {
    accuracy: lastQuarter.filter(r => r.wasCorrect).length / quarter,
    speed: calculateMean(lastQuarter.map(r => r.responseTime))
  };
  
  // Calculate fatigue based on accuracy and speed degradation
  const accuracyDrop = Math.max(0, firstPerf.accuracy - lastPerf.accuracy);
  const speedDrop = Math.max(0, lastPerf.speed - firstPerf.speed) / firstPerf.speed;
  
  return Math.min(100, (accuracyDrop * 50 + speedDrop * 50));
};

const calculateConsistencyIndex = (responses: GoNoGoGameState['responses']): number => {
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

const calculateCompositeScore = (
  inhibition: GoNoGoMetrics['inhibition'],
  attention: GoNoGoMetrics['attention'],
  processing: GoNoGoMetrics['processing'],
  learning: GoNoGoMetrics['learning']
): number => {
  // Weighted combination of all major components
  return Math.min(100, (
    inhibition.accuracy * 0.25 +
    attention.sustainedAttention * 0.25 +
    processing.processingEfficiency * 0.25 +
    learning.learningRate * 0.25
  ));
}; 