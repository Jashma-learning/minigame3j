'use client';

import React from 'react';
import { GameObject } from '@/types/game';

interface DraggableObjectProps {
  object: GameObject;
  onDragStart: (objectId: string) => void;
}

const DraggableObject: React.FC<DraggableObjectProps> = ({ object, onDragStart }) => {
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
      className={`
        w-12 h-12 flex items-center justify-center
        bg-purple-100 rounded-lg cursor-grab active:cursor-grabbing
        hover:bg-purple-200 transition-colors
        ${object.glow ? 'animate-pulse' : ''}
      `}
      draggable="true"
      onDragStart={(e) => {
        e.currentTarget.classList.add('opacity-50');
        e.dataTransfer.setData('text', object.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(object.id);
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove('opacity-50');
      }}
      style={{ color: object.color }}
    >
      {renderObjectIcon(object.geometry)}
    </div>
  );
};

export default DraggableObject; 