import React from 'react';

interface TowerProps {
  towers: number[][];
  selectedTower: number | null;
  onTowerClick: (index: number) => void;
}

export default function Tower({ towers, selectedTower, onTowerClick }: TowerProps) {
  return (
    <div className="flex justify-center gap-16 p-8">
      {towers.map((tower, towerIndex) => (
        <div
          key={towerIndex}
          className={`flex flex-col justify-end items-center relative w-64 h-64 
            ${selectedTower === towerIndex ? 'bg-amber-800/30' : 'bg-amber-900/20'} 
            rounded-lg cursor-pointer transition-colors duration-200 hover:bg-amber-800/40`}
          onClick={() => onTowerClick(towerIndex)}
        >
          {/* Base pole */}
          <div className="absolute bottom-0 w-4 h-full bg-amber-700 rounded-t-full" />

          {/* Base platform */}
          <div className="w-full h-4 bg-amber-800 rounded-lg z-10" />

          {/* Disks */}
          <div className="flex flex-col-reverse mb-4 items-center absolute bottom-4">
            {tower.map((diskSize, diskIndex) => (
              <Disk 
                key={diskIndex} 
                size={diskSize} 
                isTop={diskIndex === tower.length - 1 && selectedTower === towerIndex}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface DiskProps {
  size: number;
  isTop: boolean;
}

function Disk({ size, isTop }: DiskProps) {
  const width = 40 + size * 20; // Base width + size multiplier

  return (
    <div
      className={`h-8 rounded-lg transition-all duration-200 flex items-center justify-center
        ${isTop ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
        ${getDiskColorClass(size)}`}
      style={{ width: `${width}px` }}
    >
      <span className="text-xs font-bold text-amber-100/80">{size}</span>
    </div>
  );
}

function getDiskColorClass(size: number): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500'
  ];
  return colors[size - 1] || colors[0];
} 