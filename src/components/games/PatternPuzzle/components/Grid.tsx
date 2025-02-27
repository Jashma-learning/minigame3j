import React, { useState, useCallback } from 'react';

interface GridProps {
  pattern: number[][];
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
  showHint?: { row: number; col: number } | null;
}

export default function Grid({ pattern = [[]], onCellClick, interactive = false, showHint = null }: GridProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  // Early return if pattern is invalid
  if (!pattern || !pattern.length || !pattern[0]) {
    return null;
  }

  const handleClick = useCallback((row: number, col: number) => {
    if (interactive && onCellClick) {
      onCellClick(row, col);
    }
  }, [interactive, onCellClick]);

  return (
    <div className="grid gap-2 p-4 bg-indigo-900/30 rounded-xl shadow-xl">
      {pattern.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {row.map((cell, colIndex) => {
            const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;
            const isHint = showHint?.row === rowIndex && showHint?.col === colIndex;

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-12 h-12 rounded-lg transition-all duration-200
                  ${cell ? 'bg-purple-600' : 'bg-indigo-900'}
                  ${isHovered && interactive ? 'scale-105' : ''}
                  ${isHint ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
                  ${interactive ? 'hover:bg-purple-500 cursor-pointer' : 'cursor-default'}
                  ${cell ? 'shadow-lg shadow-purple-500/50' : ''}
                `}
                onClick={() => handleClick(rowIndex, colIndex)}
                onMouseEnter={() => interactive && setHoveredCell({ row: rowIndex, col: colIndex })}
                onMouseLeave={() => interactive && setHoveredCell(null)}
                disabled={!interactive}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
} 