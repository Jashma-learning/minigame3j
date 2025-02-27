'use client';

import React from 'react';
import { GameState } from '@/types/maze';

interface Objective {
  id: string;
  type: 'collect' | 'reach' | 'solve';
  description: string;
  completed: boolean;
  position: { x: number; y: number; z: number };
}

interface HUDProps {
  level: number;
  score: number;
  health: number;
  stamina: number;
  inventory: string[];
  activeEffects: string[];
}

export default function HUD({
  level,
  score,
  health,
  stamina,
  inventory,
  activeEffects
}: HUDProps) {
  return (
    <div className="absolute inset-x-0 top-0 p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto">
        {/* Top Bar */}
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between text-white">
          <div>
            <div className="text-sm opacity-75">Level</div>
            <div className="text-2xl font-bold">{level}</div>
          </div>
          <div>
            <div className="text-sm opacity-75">Score</div>
            <div className="text-2xl font-bold">{score.toLocaleString()}</div>
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-sm opacity-75">Health</div>
              <div className="w-32 h-2 bg-red-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-300"
                  style={{ width: `${health}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-sm opacity-75">Stamina</div>
              <div className="w-32 h-2 bg-blue-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
                  style={{ width: `${stamina}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          {/* Inventory */}
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-2 flex gap-2">
            {inventory.map((item, index) => (
              <div
                key={index}
                className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center text-white text-xl
                         hover:bg-purple-800/50 transition-colors duration-200 cursor-pointer"
              >
                {getItemIcon(item)}
              </div>
            ))}
            {inventory.length === 0 && (
              <div className="w-12 h-12 bg-gray-800/30 rounded-lg flex items-center justify-center text-gray-400">
                Empty
              </div>
            )}
          </div>

          {/* Active Effects */}
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-2 flex gap-2">
            {activeEffects.map((effect, index) => (
              <div
                key={index}
                className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center text-white text-xl
                         animate-pulse"
              >
                {getEffectIcon(effect)}
              </div>
            ))}
            {activeEffects.length === 0 && (
              <div className="w-12 h-12 bg-gray-800/30 rounded-lg flex items-center justify-center text-gray-400">
                No Effects
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getItemIcon(item: string): string {
  switch (item) {
    case 'key':
      return '🗝️';
    case 'artifact':
      return '🏺';
    case 'powerup':
      return '⚡';
    default:
      return '📦';
  }
}

function getEffectIcon(effect: string): string {
  switch (effect) {
    case 'speed_boost':
      return '🏃';
    case 'puzzle_hint':
      return '💡';
    case 'reveal_path':
      return '👁️';
    case 'extra_time':
      return '⌛';
    case 'shield':
      return '🛡️';
    default:
      return '✨';
  }
} 