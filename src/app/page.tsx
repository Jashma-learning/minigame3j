'use client';

import { gameSeriesConfig } from '../utils/gameSeriesConfig';
import Link from 'next/link';
import { useGameProgress } from '../contexts/GameProgressContext';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Cognitive Assessment Games
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gameSeriesConfig.map((game) => (
            <Link
              key={game.id}
              href={game.path}
              className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{game.name}</h2>
                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                  {game.difficulty}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">
                {game.description}
              </p>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Duration: {game.estimatedDuration}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
} 