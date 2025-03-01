'use client';

import React from 'react';
import GameSeriesReport from '../../components/GameSeriesReport';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Game Series Report</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </button>
        </div>
        <GameSeriesReport />
      </div>
    </div>
  );
} 