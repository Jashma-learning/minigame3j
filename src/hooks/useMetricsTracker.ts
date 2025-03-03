import { useState, useCallback } from 'react';
import { BaseMetric, createMetric } from '../types/cognitive/metrics.types';
import { calculateCognitiveMetrics } from '../utils/cognitiveMetricsCalculator';

interface MetricsTrackerState {
  metrics: BaseMetric[];
  isTracking: boolean;
  startTime: number | null;
}

export const useMetricsTracker = () => {
  const [state, setState] = useState<MetricsTrackerState>({
    metrics: [],
    isTracking: false,
    startTime: null
  });

  const startTracking = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTracking: true,
      startTime: Date.now(),
      metrics: []
    }));
  }, []);

  const stopTracking = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTracking: false
    }));
  }, []);

  const addMetric = useCallback((value: number) => {
    setState(prev => ({
      ...prev,
      metrics: [...prev.metrics, createMetric(value)]
    }));
  }, []);

  const calculateMetrics = useCallback(() => {
    if (state.metrics.length === 0) return null;
    return calculateCognitiveMetrics(state.metrics);
  }, [state.metrics]);

  const resetMetrics = useCallback(() => {
    setState({
      metrics: [],
      isTracking: false,
      startTime: null
    });
  }, []);

  return {
    isTracking: state.isTracking,
    metrics: state.metrics,
    startTracking,
    stopTracking,
    addMetric,
    calculateMetrics,
    resetMetrics
  };
}; 