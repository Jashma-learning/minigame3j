import React from 'react';
import { motion } from 'framer-motion';

interface ItemGridProps {
  items: Array<{ id: number; type: string; emoji: string }>;
  gridSize: number;
  onItemClick: (index: number) => void;
  disabled?: boolean;
}

const ItemGrid: React.FC<ItemGridProps> = ({ items, gridSize, onItemClick, disabled = false }) => {
  return (
    <div 
      className="grid gap-4 bg-gray-800 p-6 rounded-xl w-full aspect-square relative"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
      }}
    >
      {items.map((item, index) => (
        <motion.button
          key={item.id}
          onClick={() => !disabled && onItemClick(index)}
          className={`
            aspect-square bg-violet-600 rounded-lg
            flex items-center justify-center
            text-3xl sm:text-4xl
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-violet-500 cursor-pointer'}
          `}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
        >
          <span role="img" aria-label={item.type}>
            {item.emoji}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default ItemGrid; 