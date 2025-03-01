'use client';

import React from 'react';
import { GameObject } from '@/types/game';

interface DraggableObjectProps {
  object: GameObject;
  onDragStart: () => void;
}

const DraggableObject: React.FC<DraggableObjectProps> = ({ object, onDragStart }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text', object.id);
    onDragStart();
  };

  const renderObjectIcon = (geometry: string) => {
    switch (geometry) {
      case 'crystal':
        return '💎';
      case 'key':
        return '🗝️';
      case 'dragon':
        return '🐉';
      case 'potion':
        return '🧪';
      case 'compass':
        return '🧭';
      default:
        return '✨';
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`
        w-8 h-8 sm:w-10 sm:h-10
        flex items-center justify-center
        bg-white border border-purple-300
        rounded-md cursor-move
        hover:bg-purple-50 hover:scale-105
        transition-all duration-200
        shadow-sm hover:shadow-md
        text-base sm:text-lg
      `}
      style={{ color: object.color }}
    >
      {renderObjectIcon(object.geometry)}
    </div>
  );
};

export default DraggableObject; 