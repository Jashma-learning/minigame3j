import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { GameMetrics } from '@/types/game';

interface CognitiveMetricsChartsProps {
  metrics: GameMetrics;
  cognitiveIndices: {
    smi: number;
    psi: number;
    asi: number;
    dri: number;
    seqi: number;
    ocps: number;
  } | null;
}

export default function CognitiveMetricsCharts({ metrics, cognitiveIndices }: CognitiveMetricsChartsProps) {
  if (!cognitiveIndices) return null;

  const radarData = [
    {
      metric: 'Spatial Memory',
      value: cognitiveIndices.smi,
      threshold: 75
    },
    {
      metric: 'Processing Speed',
      value: cognitiveIndices.psi,
      threshold: 70
    },
    {
      metric: 'Attention Span',
      value: cognitiveIndices.asi,
      threshold: 80
    },
    {
      metric: 'Distraction Resistance',
      value: cognitiveIndices.dri,
      threshold: 65
    },
    {
      metric: 'Sequential Memory',
      value: cognitiveIndices.seqi,
      threshold: 70
    }
  ];

  // Prepare data for placement timeline
  const placementData = metrics.objectPlacements.map((placement, index) => ({
    name: `Object ${index + 1}`,
    time: placement.timeTaken / 1000, // Convert to seconds
    correct: placement.isCorrect ? 100 : 0,
  }));

  return (
    <div className="w-full space-y-8">
      {/* Overall Performance Radar Chart */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">Overall Cognitive Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Performance"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Radar
              name="Threshold"
              dataKey="threshold"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.3}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Placement Timeline */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">Object Placement Timeline</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={placementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Time (s)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="time"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Accuracy Distribution */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">Placement Accuracy</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={placementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="correct" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 