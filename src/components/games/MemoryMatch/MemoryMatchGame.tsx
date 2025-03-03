'use client';

import React, { useState, useEffect } from 'react';
import Card from './Card';
import { soundEffect } from '@/utils/sound';
import { useGameProgress } from '../../../contexts/GameProgressContext';
import { getNextGame } from '../../../utils/gameSeriesConfig';
import { MemoryMatchGameState, MemoryMatchMetrics } from '../../../types/cognitive/memoryMatch.types';
import { calculateMemoryMatchMetrics, calculateMatchTime } from './MemoryMatch.utils';
import { memoryMatchService } from '../../../services/memoryMatchService';

// Game icons (emojis) for cards
const ICONS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

interface MemoryMatchGameProps {
  onComplete?: (metrics: MemoryMatchMetrics) => void;
}

const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onComplete }) => {
  // Game state
  const [cards, setCards] = useState<Array<{ id: string; icon: string; isFlipped: boolean; isMatched: boolean }>>([]);
  const [gameState, setGameState] = useState<MemoryMatchGameState>({
    currentPair: [],
    matchedPairs: [],
    attempts: 0,
    viewTimestamps: {},
    matchTimes: []
  });

  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const { completeGame } = useGameProgress();
  const nextGame = getNextGame('memory-match');

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const cardPairs = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index.toString(),
        icon,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(cardPairs);
    setGameState({
      currentPair: [],
      matchedPairs: [],
      attempts: 0,
      viewTimestamps: {},
      matchTimes: []
    });
    setGameStarted(true);
  };

  const handleCardClick = (cardId: string) => {
    if (!gameStarted || gameState.currentPair.length === 2) return;
    if (gameState.currentPair.includes(cardId)) return;
    if (cards.find(c => c.id === cardId)?.isMatched) return;

    soundEffect?.playCardFlip();

    // Record first view timestamp
    if (!gameState.viewTimestamps[cardId]) {
      setGameState(prev => ({
        ...prev,
        viewTimestamps: {
          ...prev.viewTimestamps,
          [cardId]: Date.now()
        }
      }));
    }

    // Update cards and current pair
    const newCards = cards.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);
    
    const newCurrentPair = [...gameState.currentPair, cardId];
    setGameState(prev => ({
      ...prev,
      currentPair: newCurrentPair
    }));

    // Check for match when we have a pair
    if (newCurrentPair.length === 2) {
      checkForMatch(newCurrentPair);
    }
  };

  const checkForMatch = (currentPair: string[]) => {
    const [first, second] = currentPair;
    const firstCard = cards.find(c => c.id === first)!;
    const secondCard = cards.find(c => c.id === second)!;
    
    // Record match attempt time
    const attemptStartTime = Math.min(
      gameState.viewTimestamps[first] || Date.now(),
      gameState.viewTimestamps[second] || Date.now()
    );
    
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        currentPair: []
      }));

      if (firstCard.icon === secondCard.icon) {
        soundEffect?.playMatch();
        
        // Calculate match time
        const matchTime = calculateMatchTime(attemptStartTime, Date.now());

        // Update game state
        setGameState(prev => ({
          ...prev,
          matchedPairs: [...prev.matchedPairs, first, second],
          matchTimes: [...prev.matchTimes, matchTime]
        }));

        // Update cards
        setCards(prev => prev.map(card => 
          currentPair.includes(card.id) ? { ...card, isMatched: true, isFlipped: true } : card
        ));

        // Check if game is complete
        if (gameState.matchedPairs.length + 2 === cards.length) {
          endGame();
        }
      } else {
        soundEffect?.playNoMatch();
        
        // Flip cards back
        setCards(prev => prev.map(card => 
          currentPair.includes(card.id) ? { ...card, isFlipped: false } : card
        ));
      }
    }, 1000);
  };

  const endGame = async () => {
    try {
    setGameStarted(false);
      setIsGameComplete(true);

      // Calculate final metrics
      const metrics = calculateMemoryMatchMetrics(gameState);
      
      // Log detailed metrics for debugging
      console.log('Calculated metrics:', {
        gameState,
        metrics,
        memory: {
          accuracy: Math.max(0, Math.min(100, metrics.memory.accuracy)),
          reactionTime: Math.max(0, metrics.memory.reactionTime),
          span: metrics.memory.span,
          errorRate: Math.max(0, Math.min(100, metrics.memory.errorRate))
        },
        attention: {
          focusScore: Math.max(0, Math.min(100, metrics.attention.focusScore)),
          consistency: Math.max(0, Math.min(100, metrics.attention.consistency)),
          deliberationTime: Math.max(0, metrics.attention.deliberationTime)
        },
        processing: {
          cognitiveLoad: Math.max(0, Math.min(100, metrics.processing.cognitiveLoad)),
          processingSpeed: Math.max(0, metrics.processing.processingSpeed),
          efficiency: Math.max(0, Math.min(100, metrics.processing.efficiency))
        },
        overall: {
          performanceScore: Math.max(0, Math.min(100, metrics.overall.performanceScore)),
          confidenceLevel: Math.max(0, Math.min(100, metrics.overall.confidenceLevel)),
          percentileRank: Math.max(0, Math.min(100, metrics.overall.percentileRank))
        }
      });
      
      // Validate metrics before sending
      if (isNaN(metrics.memory.accuracy) || 
          isNaN(metrics.memory.reactionTime) ||
          isNaN(metrics.attention.focusScore) ||
          isNaN(metrics.processing.efficiency)) {
        throw new Error('Invalid metrics calculated');
      }

      // Send metrics to parent
      onComplete?.(metrics);

      // Complete game in progress context
      completeGame('memory-match', metrics.memory.accuracy);

      console.log('Starting endGame process...');

      // First test the connection
      await memoryMatchService.testConnection();
      console.log('Backend connection test successful');

      // Store the metrics
      const result = await memoryMatchService.storeMetrics('test_user_123', {
        memory: {
          accuracy: Math.max(0, Math.min(100, metrics.memory.accuracy)),
          reactionTime: Math.max(0, metrics.memory.reactionTime),
          span: metrics.memory.span,
          errorRate: Math.max(0, Math.min(100, metrics.memory.errorRate))
        },
        attention: {
          focusScore: Math.max(0, Math.min(100, metrics.attention.focusScore)),
          consistency: Math.max(0, Math.min(100, metrics.attention.consistency)),
          deliberationTime: Math.max(0, metrics.attention.deliberationTime)
        },
        processing: {
          cognitiveLoad: Math.max(0, Math.min(100, metrics.processing.cognitiveLoad)),
          processingSpeed: Math.max(0, metrics.processing.processingSpeed),
          efficiency: Math.max(0, Math.min(100, metrics.processing.efficiency))
        },
        trends: {
          accuracyTrend: 0, // These will be calculated on the backend
          speedTrend: 0,
          learningRate: 0
        },
        overall: {
          performanceScore: Math.max(0, Math.min(100, metrics.overall.performanceScore)),
          confidenceLevel: Math.max(0, Math.min(100, metrics.overall.confidenceLevel)),
          percentileRank: Math.max(0, Math.min(100, metrics.overall.percentileRank))
        }
      });

      console.log('Metrics stored successfully:', result);

    } catch (error) {
      console.error('Error storing metrics:', error);
      alert('Failed to store game metrics. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      <div className="container mx-auto px-2 py-2">
        <h1 className="text-2xl font-bold mb-2 text-center">Memory Match</h1>
        
        <div className="flex flex-col items-center max-w-2xl mx-auto">
          {/* Game Stats */}
          <div className="w-full mb-2">
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              <div className="px-3 py-1 bg-blue-100 rounded text-blue-900 text-sm">
                Attempts: {gameState.attempts}
                </div>
              <div className="px-3 py-1 bg-green-100 rounded text-green-900 text-sm">
                Matches: {gameState.matchedPairs.length / 2}
              </div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="w-full max-w-[400px] mb-2">
            <div 
              className="grid gap-1 w-full grid-cols-4"
              style={{ aspectRatio: '1' }}
            >
              {cards.map((card) => (
                <Card
                  key={card.id}
                  {...card}
                  onClick={() => handleCardClick(card.id)}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          {!isGameComplete && (
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                onClick={initializeGame}
              >
                New Game
              </button>
          )}

          {/* Game Complete Message */}
          {isGameComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg text-center">
                <h2 className="text-xl font-bold mb-2">Cognitive Assessment Complete</h2>
                <div className="space-y-2 mb-4">
                  {/* Memory Metrics */}
                  <div className="border-b pb-2">
                    <h3 className="font-semibold text-blue-600">Memory Performance</h3>
                    <p className="text-sm">
                      Accuracy: {Math.round(calculateMemoryMatchMetrics(gameState).memory.accuracy)}%
                    </p>
                    <p className="text-sm">
                      Reaction Time: {calculateMemoryMatchMetrics(gameState).memory.reactionTime.toFixed(2)}s
                    </p>
                  </div>
                  
                  {/* Attention Metrics */}
                  <div className="border-b pb-2">
                    <h3 className="font-semibold text-purple-600">Attention Metrics</h3>
                    <p className="text-sm">
                      Focus Score: {Math.round(calculateMemoryMatchMetrics(gameState).attention.focusScore)}%
                    </p>
                    <p className="text-sm">
                      Consistency: {Math.round(calculateMemoryMatchMetrics(gameState).attention.consistency)}%
                    </p>
                  </div>

                  {/* Processing Metrics */}
                  <div className="border-b pb-2">
                    <h3 className="font-semibold text-green-600">Processing Speed</h3>
                    <p className="text-sm">
                      Efficiency: {Math.round(calculateMemoryMatchMetrics(gameState).processing.efficiency)}%
                    </p>
                    <p className="text-sm">
                      Cognitive Load: {Math.round(calculateMemoryMatchMetrics(gameState).processing.cognitiveLoad)}%
                    </p>
                  </div>

                  {/* Overall Score */}
                  <div>
                    <h3 className="font-semibold text-indigo-600">Overall Performance</h3>
                    <p className="text-sm">
                      Score: {Math.round(calculateMemoryMatchMetrics(gameState).overall.performanceScore)}%
                    </p>
            </div>
          </div>
                <p className="text-sm text-gray-600 mt-2">Moving to next assessment...</p>
              </div>
            </div>
          )}
          </div>
      </div>
    </div>
  );
};

export default MemoryMatchGame; 