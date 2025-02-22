'use client';

import { useState, useEffect, useCallback } from 'react';

interface DistractionGameProps {
  onComplete: (score: number) => void;
}

export default function DistractionGame({ onComplete }: DistractionGameProps) {
  const [fireflyPosition, setFireflyPosition] = useState({ x: 50, y: 50 });
  const [isGolden, setIsGolden] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [trail, setTrail] = useState<{ x: number; y: number; age: number }[]>([]);

  const moveFirefly = useCallback(() => {
    setFireflyPosition({
      x: Math.random() * 70 + 15,
      y: Math.random() * 70 + 15,
    });
    setIsGolden(Math.random() > 0.7); // 30% chance of being golden
    setTrail(prev => [
      { x: fireflyPosition.x, y: fireflyPosition.y, age: 0 },
      ...prev.slice(0, 4),
    ]);
  }, [fireflyPosition]);

  useEffect(() => {
    const interval = setInterval(moveFirefly, 1500);
    const trailInterval = setInterval(() => {
      setTrail(prev => prev.map(t => ({ ...t, age: t.age + 1 })).filter(t => t.age < 5));
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(trailInterval);
    };
  }, [moveFirefly]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete(score);
    }
  }, [timeLeft, score, onComplete]);

  const handleClick = () => {
    if (isGolden) {
      setScore(s => s + 1);
    }
    moveFirefly();
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-purple-600 mb-4">Catch the Golden Firefly!</h2>
      <div className="mb-4 flex justify-center items-center gap-4">
        <div className="text-xl">
          Time left: <span className="font-bold text-purple-600">{timeLeft}s</span>
        </div>
        <div className="text-xl">
          Magic Caught: <span className="font-bold text-purple-600">{score}</span>
        </div>
      </div>
      <div className="relative w-[500px] h-[300px] bg-indigo-900 rounded-2xl overflow-hidden shadow-xl border-4 border-purple-300">
        {/* Firefly trail */}
        {trail.map((t, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '24px',
              height: '24px',
              backgroundColor: isGolden ? '#FFD700' : '#00ff00',
              opacity: (5 - t.age) / 10,
            }}
          />
        ))}
        {/* Clickable area (larger than the visible firefly) */}
        <button
          className={`absolute rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none`}
          style={{
            left: `${fireflyPosition.x}%`,
            top: `${fireflyPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            width: '48px',
            height: '48px',
            boxShadow: isGolden
              ? '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700'
              : '0 0 10px #00ff00',
          }}
          onClick={handleClick}
        />
      </div>
    </div>
  );
} 