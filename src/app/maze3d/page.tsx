'use client';

import Maze3DGame from '@/components/games/Maze3D/Maze3DGame';

export default function Maze3DPage() {
  return (
    <div style={{ 
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'stretch',
      background: '#000'
    }}>
      <Maze3DGame width={15} height={15} debug={false} />
    </div>
  );
} 