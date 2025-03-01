'use client';

import { useState, useEffect, useCallback } from 'react';
import { BaseMetric } from '../../../types/cognitiveMetrics';

interface DistractionGameProps {
  onComplete: (score: BaseMetric) => void;
}

export default function DistractionGame({ onComplete }: DistractionGameProps) {
  const [fireflyPosition, setFireflyPosition] = useState({ x: 50, y: 50 });
  const [isGolden, setIsGolden] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [trail, setTrail] = useState<{ x: number; y: number; age: number; color: string }[]>([]);
  const [combo, setCombo] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showBonus, setShowBonus] = useState<{ text: string; x: number; y: number; age: number } | null>(null);

  const moveFirefly = useCallback(() => {
    const newX = Math.random() * 70 + 15;
    const newY = Math.random() * 70 + 15;
    
    setFireflyPosition({ x: newX, y: newY });
    setIsGolden(Math.random() > 0.7);
    
    setTrail(prev => [
      {
        x: fireflyPosition.x,
        y: fireflyPosition.y,
        age: 0,
        color: isGolden ? '#FFD700' : '#00ff00'
      },
      ...prev.slice(0, 4)
    ]);
  }, [fireflyPosition, isGolden]);

  useEffect(() => {
    const interval = setInterval(moveFirefly, isGolden ? 1200 : 1500);
    const trailInterval = setInterval(() => {
      setTrail(prev => prev.map(t => ({ ...t, age: t.age + 1 })).filter(t => t.age < 5));
      if (showBonus) {
        setShowBonus(prev => prev && prev.age < 10 ? { ...prev, age: prev.age + 1 } : null);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(trailInterval);
    };
  }, [moveFirefly, isGolden, showBonus]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete({
        value: score,
        timestamp: Date.now()
      });
    }
  }, [timeLeft, score, onComplete]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    
    if (isGolden) {
      let points = 1;
      
      // Combo system
      if (timeDiff < 1000) { // If clicked within 1 second of last successful click
        setCombo(prev => {
          const newCombo = prev + 1;
          points = Math.min(newCombo, 5); // Cap combo multiplier at 5x
          return newCombo;
        });
      } else {
        setCombo(1);
      }
      
      setScore(s => s + points);
      setLastClickTime(now);
      
      // Show bonus points popup
      const rect = e.currentTarget.getBoundingClientRect();
      setShowBonus({
        text: points > 1 ? `+${points} (${points}x)!` : '+1',
        x: fireflyPosition.x,
        y: fireflyPosition.y,
        age: 0
      });
    } else {
      setCombo(0);
    }
    moveFirefly();
  };

  return (
    <div className="text-center w-full">
      <h2 className="text-xl font-bold text-purple-600 mb-2">Catch the Golden Firefly!</h2>
      <div className="mb-2 flex justify-center items-center gap-4 text-sm">
        <div className="bg-purple-100 px-3 py-1 rounded-full">
          Time: <span className="font-bold text-purple-600">{timeLeft}s</span>
        </div>
        <div className="bg-purple-100 px-3 py-1 rounded-full">
          Score: <span className="font-bold text-purple-600">{score}</span>
        </div>
        {combo > 1 && (
          <div className="bg-yellow-100 px-3 py-1 rounded-full animate-pulse">
            Combo: <span className="font-bold text-yellow-600">x{Math.min(combo, 5)}</span>
          </div>
        )}
      </div>
      <div className="relative w-full max-w-[280px] aspect-square mx-auto bg-gradient-to-br from-indigo-900 to-purple-900 rounded-lg overflow-hidden shadow-xl border-2 border-purple-300">
        {/* Firefly trail */}
        {trail.map((t, i) => (
          <div
            key={i}
            className="absolute rounded-full transition-opacity duration-200"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              backgroundColor: t.color,
              opacity: (5 - t.age) / 10,
              filter: `blur(${t.age}px)`,
            }}
          />
        ))}
        
        {/* Bonus points popup */}
        {showBonus && (
          <div
            className="absolute text-sm font-bold transition-all duration-200"
            style={{
              left: `${showBonus.x}%`,
              top: `${showBonus.y}%`,
              transform: `translate(-50%, -${50 + showBonus.age * 5}%)`,
              color: showBonus.text.includes('x') ? '#FFD700' : '#ffffff',
              opacity: 1 - showBonus.age / 10,
            }}
          >
            {showBonus.text}
          </div>
        )}
        
        {/* Clickable firefly */}
        <button
          className="absolute rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none"
          style={{
            left: `${fireflyPosition.x}%`,
            top: `${fireflyPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            width: '32px',
            height: '32px',
            background: `radial-gradient(circle, ${isGolden ? '#FFD700' : '#00ff00'} 0%, transparent 70%)`,
            boxShadow: isGolden
              ? '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700'
              : '0 0 10px #00ff00, 0 0 15px #00ff00',
            animation: isGolden ? 'pulse 1s infinite' : 'none',
          }}
          onClick={handleClick}
        />
      </div>
      <p className="text-xs text-purple-600 mt-2">
        {isGolden ? "Quick! It's golden! 🌟" : "Wait for it to turn golden..."}
      </p>
    </div>
  );
} 