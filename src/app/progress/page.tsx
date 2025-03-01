'use client';

import React from 'react';
import ProgressDashboard from '../../components/ProgressDashboard';

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Your Progress
        </h1>
        <ProgressDashboard />
      </div>
    </div>
  );
} 