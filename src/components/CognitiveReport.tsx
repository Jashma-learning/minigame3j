import React, { useEffect } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import type { CognitiveReport } from '@/types/cognitive';

interface CognitiveReportProps {
  report: CognitiveReport;
  onClose: () => void;
}

export default function CognitiveReport({ report, onClose }: CognitiveReportProps) {
  const radarData = [
    {
      metric: 'Spatial Memory',
      score: report.averageScores.spatialMemory,
      percentile: report.percentileRanking.spatialMemory
    },
    {
      metric: 'Decision Making',
      score: report.averageScores.decisionMaking,
      percentile: report.percentileRanking.decisionMaking
    },
    {
      metric: 'Attention',
      score: report.averageScores.attention,
      percentile: report.percentileRanking.attention
    }
  ];

  const progressData = report.assessments.map((assessment, index) => ({
    attempt: index + 1,
    spatialMemory: assessment.scores.spatialMemory,
    decisionMaking: assessment.scores.decisionMaking,
    attention: assessment.scores.attention,
    overall: assessment.scores.overallScore
  }));

  useEffect(() => {
    // Add any animations or transitions if needed
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-purple-800">Cognitive Assessment Report</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
            <div className="h-[300px]">
              <ResponsiveContainer>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Percentile"
                    dataKey="percentile"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.4}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Progress Over Attempts</h3>
            <div className="h-[300px]">
              <ResponsiveContainer>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="attempt" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="overall"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Scores and Rankings */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg shadow-md">
            <div className="text-sm text-purple-600">Overall Score</div>
            <div className="text-2xl font-bold text-purple-900">
              {report.averageScores.overallScore.toFixed(1)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-md">
            <div className="text-sm text-green-600">Percentile Ranking</div>
            <div className="text-2xl font-bold text-green-900">
              {report.percentileRanking.overall.toFixed(1)}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-md">
            <div className="text-sm text-blue-600">Improvement</div>
            <div className="text-2xl font-bold text-blue-900">
              {report.improvement > 0 ? '+' : ''}{report.improvement.toFixed(1)}%
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg shadow-md">
            <div className="text-sm text-orange-600">Attempts</div>
            <div className="text-2xl font-bold text-orange-900">
              {report.assessments.length}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {report.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
} 