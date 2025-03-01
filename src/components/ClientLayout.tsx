'use client';

import React from 'react';
import { GameProgressProvider } from "../contexts/GameProgressContext";
import { ProgressProvider } from "../contexts/ProgressContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>
      <ProgressProvider>
        <GameProgressProvider>
          {children}
        </GameProgressProvider>
      </ProgressProvider>
    </>
  );
} 