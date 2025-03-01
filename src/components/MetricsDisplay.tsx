import React from 'react';
import { GameSpecificMetrics } from '../types/cognitiveMetrics';

interface MetricsDisplayProps {
  metrics: Partial<GameSpecificMetrics>;
  title?: string;
}

const formatMetricName = (name: string): string => {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim();
};

const formatMetricValue = (value: number, metricName: string): string => {
  if (metricName.toLowerCase().includes('time') || 
      metricName.toLowerCase().includes('speed')) {
    return `${value.toFixed(2)}ms`;
  }
  if (metricName.toLowerCase().includes('accuracy') || 
      metricName.toLowerCase().includes('rate') ||
      metricName.toLowerCase().includes('percentage')) {
    return `${value.toFixed(1)}%`;
  }
  return value.toFixed(1);
};

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics, title }) => {
  if (!metrics || Object.keys(metrics).length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      {title && (
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
      )}
      <div className="space-y-2">
        {Object.entries(metrics).map(([key, metric]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-600">{formatMetricName(key)}:</span>
            <span className="font-medium text-gray-800">
              {formatMetricValue(metric.value, key)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsDisplay; 