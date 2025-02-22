import React, { useState } from 'react';
import { GameObject } from '@/types/game';

interface GridProps {
  objects: GameObject[];
  isInteractive: boolean;
  onObjectPlaced: (objectId: string, position: [number, number]) => void;
}

const Grid: React.FC<GridProps> = ({ objects, isInteractive, onObjectPlaced }) => {
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);

  // Helper function to render the object icon based on geometry
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (isInteractive) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setHighlightedCell(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (isInteractive) {
      e.preventDefault();
      setHighlightedCell(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, x: number, y: number) => {
    if (isInteractive) {
      e.preventDefault();
      e.stopPropagation();
      setHighlightedCell(null);
      
      const objectId = e.dataTransfer.getData('text');
      if (objectId) {
        onObjectPlaced(objectId, [x, y]);
      }
    }
  };

  return (
    <div className="grid grid-cols-5 gap-2 w-full h-full">
      {Array.from({ length: 25 }).map((_, index) => {
        const gridX = index % 5;
        const gridY = Math.floor(index / 5);
        const object = objects.find(
          obj => obj.position[0] === gridX && obj.position[1] === gridY
        );

        const isHighlighted = highlightedCell === index;

        return (
          <div
            key={index}
            className={`
              aspect-square border-2 rounded-lg flex items-center justify-center
              transition-all duration-200
              ${isInteractive ? 'border-dashed border-purple-300' : 'border-solid border-purple-200'}
              ${object ? 'bg-purple-50' : 'bg-white'}
              ${isInteractive ? 'cursor-pointer' : ''}
              ${isHighlighted ? 'bg-purple-200 scale-105' : ''}
            `}
            data-grid-x={gridX}
            data-grid-y={gridY}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, gridX, gridY)}
          >
            {object && (
              <div 
                className={`
                  w-full h-full flex items-center justify-center text-2xl
                  transition-transform duration-200
                  ${isHighlighted ? 'scale-110' : ''}
                  ${object.glow ? 'animate-pulse' : ''}
                `}
                style={{ color: object.color }}
              >
                {renderObjectIcon(object.geometry)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Grid; 