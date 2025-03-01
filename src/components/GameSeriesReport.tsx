import React from 'react';
import { useProgress } from '../contexts/ProgressContext';
import { gameSeriesConfig } from '../utils/gameSeriesConfig';
import { motion } from 'framer-motion';
import MetricsDisplay from './MetricsDisplay';

const GameSeriesReport: React.FC = () => {
  const { progress, getCognitiveProfile } = useProgress();
  const cognitiveProfile = getCognitiveProfile();

  const getGameStatus = (gameId: string) => {
    const gameProgress = progress[gameId];
    if (!gameProgress) return 'Not Started';
    if (gameProgress.completed) return 'Completed';
    return 'In Progress';
  };

  const calculateOverallScore = () => {
    let totalScore = 0;
    let completedGames = 0;
    
    Object.entries(progress).forEach(([_, gameProgress]) => {
      if (gameProgress.completed) {
        totalScore += gameProgress.bestScore || 0;
        completedGames++;
      }
    });

    return {
      score: totalScore,
      completedGames,
      totalGames: gameSeriesConfig.length
    };
  };

  const overallStats = calculateOverallScore();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Overall Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold mb-4">Overall Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Score</h3>
            <p className="text-3xl font-bold text-blue-600">{overallStats.score}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Games Completed</h3>
            <p className="text-3xl font-bold text-green-600">
              {overallStats.completedGames}/{overallStats.totalGames}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">Completion Rate</h3>
            <p className="text-3xl font-bold text-purple-600">
              {Math.round((overallStats.completedGames / overallStats.totalGames) * 100)}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cognitive Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold mb-4">Cognitive Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(cognitiveProfile).map(([domain, score]) => (
            <div key={domain} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold capitalize">{domain.replace('_', ' ')}</h3>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">{Math.round(score)}% Proficiency</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Individual Game Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold mb-4">Game Details</h2>
        <div className="space-y-4">
          {gameSeriesConfig.map((game) => {
            const gameProgress = progress[game.id];
            const status = getGameStatus(game.id);

            return (
              <div
                key={game.id}
                className={`p-4 rounded-lg border ${
                  status === 'Completed'
                    ? 'border-green-200 bg-green-50'
                    : status === 'In Progress'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{game.name}</h3>
                    <p className="text-sm text-gray-600">{game.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : status === 'In Progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {gameProgress?.completed && gameProgress.metrics && (
                  <div className="mt-4">
                    <MetricsDisplay metrics={gameProgress.metrics[gameProgress.metrics.length - 1]} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default GameSeriesReport; 