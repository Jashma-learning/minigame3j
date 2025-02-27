'use client';

import React from 'react';
import { GameObject } from '@/types/game';

interface DraggableObjectProps {
  object: GameObject;
  onDragStart?: (objectId: string) => void;
  isInteractive?: boolean;
  onPlaced?: (objectId: string, position: [number, number]) => void;
  initialPosition?: [number, number];
}

const DraggableObject: React.FC<DraggableObjectProps> = ({ 
  object, 
  onDragStart = () => {}, 
  isInteractive = true,
  onPlaced,
  initialPosition 
}) => {
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
        bg-purple-100 rounded-lg 
        ${isInteractive ? 'cursor-grab active:cursor-grabbing hover:bg-purple-200' : 'cursor-default'}
        transition-colors
        ${object.glow ? 'animate-pulse' : ''}
      `}
      draggable={isInteractive ? "true" : "false"}
      onDragStart={(e) => {
        if (!isInteractive) return;
        e.currentTarget.classList.add('opacity-50');
        e.dataTransfer.setData('text', object.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(object.id);
      }}
      onDragEnd={(e) => {
        if (!isInteractive) return;
        e.currentTarget.classList.remove('opacity-50');
      }}
      style={{ color: object.color }}
    >
      {renderObjectIcon(object.geometry)}
    </div>
  );
};

export default DraggableObject; 