import React from 'react';
import { useProgress } from '../contexts/ProgressContext';
import { gameSeriesConfig } from '../utils/gameSeriesConfig';

const SkillIcon = ({ skillType }: { skillType: string }) => {
  const icons: Record<string, string> = {
    memory: '🧠',
    attention: '👀',
    processing: '⚡',
    executive: '👑',
    spatial: '🗺️'
  };

  return <span className="text-2xl">{icons[skillType] || '📊'}</span>;
};

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const ProgressDashboard: React.FC = () => {
  const { getOverallProgress, getSkillProgress, getCognitiveProfile, progress } = useProgress();
  const overallProgress = getOverallProgress();
  const cognitiveProfile = getCognitiveProfile();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Overall Progress</h2>
        <div className="mb-2">
          <span className="text-gray-600">
            {Math.round(overallProgress)}% Complete
          </span>
          <ProgressBar value={overallProgress} />
        </div>
        <p className="text-sm text-gray-500">
          {Object.values(progress).filter(g => g.completed).length} of {gameSeriesConfig.length} games completed
        </p>
      </div>

      {/* Cognitive Skills */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Cognitive Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(cognitiveProfile).map(([skill, value]) => (
            <div key={skill} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <SkillIcon skillType={skill} />
                <h3 className="text-lg font-semibold capitalize">
                  {skill}
                </h3>
              </div>
              <ProgressBar value={value} />
              <p className="text-sm text-gray-600 mt-1">
                {Math.round(value)}% Proficiency
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Games */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Games</h2>
        <div className="space-y-4">
          {gameSeriesConfig.map(game => {
            const gameProgress = progress[game.id];
            const lastPlayed = gameProgress?.lastPlayed
              ? new Date(gameProgress.lastPlayed).toLocaleDateString()
              : 'Not played yet';

            return (
              <div
                key={game.id}
                className={`p-4 rounded-lg ${
                  gameProgress?.completed
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{game.name}</h3>
                    <p className="text-sm text-gray-600">Last played: {lastPlayed}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    gameProgress?.completed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {gameProgress?.completed ? 'Completed' : 'Not Started'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard; 