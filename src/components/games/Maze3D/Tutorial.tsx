'use client';

import React, { useState } from 'react';
import { Position3D } from '@/types/maze';

interface TutorialProps {
  onComplete: () => void;
  playerPosition: Position3D;
  isActive: boolean;
}

interface TutorialStep {
  title: string;
  content: string;
  position: 'center' | 'top' | 'bottom' | 'controls';
  condition?: () => boolean;
  highlight?: string[];
}

export default function Tutorial({ onComplete, playerPosition, isActive }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome!",
      content: "Let's explore this magical maze together. I'll guide you through the basics.",
      position: "center"
    },
    {
      title: "First, Let's Move",
      content: "Press W to move forward",
      position: "controls",
      highlight: ["KeyW"]
    },
    {
      title: "Turn Around",
      content: "Use A and D to turn left and right",
      position: "controls",
      highlight: ["KeyA", "KeyD"]
    },
    {
      title: "Move Backwards",
      content: "Press S to move backwards if needed",
      position: "controls",
      highlight: ["KeyS"]
    },
    {
      title: "Look Around",
      content: "Move your mouse to look around the maze",
      position: "center"
    },
    {
      title: "Follow the Path",
      content: "The floor glows purple where you've been - this helps you avoid getting lost",
      position: "bottom",
      highlight: ["floor"]
    },
    {
      title: "Collect Items",
      content: "Look for shiny objects in the maze - they'll help you on your journey",
      position: "bottom",
      highlight: ["collectible"]
    },
    {
      title: "Ready?",
      content: "Take your time exploring. You can pause anytime with the button in the top-right corner.",
      position: "center"
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isActive) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      {/* Tutorial content */}
      <div className={`
        absolute pointer-events-auto
        ${step.position === 'center' ? 'inset-0 flex items-center justify-center' :
          step.position === 'top' ? 'top-8 left-1/2 -translate-x-1/2' :
          step.position === 'bottom' ? 'bottom-8 left-1/2 -translate-x-1/2' :
          'bottom-32 left-1/2 -translate-x-1/2'}
      `}>
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg">
          <h3 className="text-3xl font-bold text-purple-800 mb-4">{step.title}</h3>
          <p className="text-gray-700 text-xl mb-6 leading-relaxed">{step.content}</p>
          
          <div className="flex justify-between items-center">
            {/* Progress indicator */}
            <div className="flex gap-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentStep ? 'bg-purple-600 scale-125' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSkip}
                className="px-6 py-3 text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-purple-600 text-white text-base rounded-lg hover:bg-purple-700 transition shadow-lg"
              >
                {isLastStep ? "Start Game" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control hints */}
      {step.position === 'controls' && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 flex gap-4">
          {['W', 'A', 'S', 'D'].map(key => (
            <div
              key={key}
              className={`
                w-20 h-20 flex items-center justify-center
                bg-white rounded-xl shadow-2xl text-3xl font-bold
                transition-all duration-300
                ${step.highlight?.includes(`Key${key}`) 
                  ? 'bg-purple-100 text-purple-600 ring-4 ring-purple-400 scale-125' 
                  : 'opacity-40'}
              `}
            >
              {key}
            </div>
          ))}
        </div>
      )}

      {/* Visual highlights for game elements */}
      {step.highlight?.map(element => (
        <div
          key={element}
          className="absolute inset-0 pointer-events-none"
          style={{
            border: '4px solid #9f7aea',
            animation: 'pulse 2s infinite',
            borderRadius: '16px'
          }}
        />
      ))}
    </div>
  );
} 