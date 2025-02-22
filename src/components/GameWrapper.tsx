'use client';

import dynamic from 'next/dynamic';

const MemoryRecallGame = dynamic(
  () => import('./games/MemoryRecall/MemoryRecallGame'),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function GameWrapper() {
  return <MemoryRecallGame />;
} 