import { useState, useCallback } from 'react';
import { BaseMetric, createMetric } from '../types/cognitiveMetrics';
import { calculateCognitiveMetrics } from '../utils/cognitiveMetricsCalculator';

interface MetricsTrackerState {
  metrics: Record<string, BaseMetric>;
  startTime: number;
}

export const useMetricsTracker = (gameId: string) => {
  const [state, setState] = useState<MetricsTrackerState>({
    metrics: {},
    startTime: Date.now(),
  });

  const trackMetric = useCallback((
    metricName: string,
    value: number
  ) => {
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [metricName]: createMetric(value)
      }
    }));
  }, []);

  const submitMetrics = useCallback(async () => {
    try {
      // Calculate cognitive metrics from game metrics
      const cognitiveMetrics = calculateCognitiveMetrics(state.metrics);
      
      // In a real app, you'd get the userId from auth context
      const userId = 'test-user';
      
      const response = await fetch(`http://localhost:3001/api/metrics/${gameId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          metrics: state.metrics,
          cognitiveMetrics
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting metrics:', error);
      throw error;
    }
  }, [gameId, state.metrics]);

  const resetMetrics = useCallback(() => {
    setState({
      metrics: {},
      startTime: Date.now(),
    });
  }, []);

  return {
    metrics: state.metrics,
    trackMetric,
    submitMetrics,
    resetMetrics,
    elapsedTime: Date.now() - state.startTime,
  };
}; 