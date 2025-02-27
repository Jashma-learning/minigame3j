import React, { useEffect, useRef, useState, useCallback } from 'react';
import { calculateCognitiveScores, generateCognitiveReport } from '@/utils/cognitiveAnalysis';
import type { NavigationMetrics, CognitiveAssessment } from '@/types/cognitive';
import CognitiveReport from '@/components/CognitiveReport';
import { generateMaze2D } from './mazeUtils'; // Import maze generation function

interface Cell {
  x: number;
  y: number;
  isWall: boolean;
  isVisited: boolean;
  isCollectible: boolean;
  isPuzzle: boolean;
  isStart: boolean;
  isEnd: boolean;
}

interface PlayerState {
  x: number;
  y: number;
  collectibles: number;
  puzzlesSolved: number;
}

interface Maze2DGameProps {
  cellSize: number;
  onComplete?: (score: number) => void;
}

export default function Maze2DGame({ cellSize, onComplete }: Maze2DGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const completionRef = useRef<{
    isCompleted: boolean;
    score: number;
  }>({ isCompleted: false, score: 0 });
  const [currentLevel, setCurrentLevel] = useState(1);
  const mazeSize = 15 + (currentLevel - 1) * 2; // Increase maze size with level
  const canvasWidth = mazeSize * cellSize;
  const canvasHeight = mazeSize * cellSize;
  
  const [maze, setMaze] = useState<Cell[][]>(generateMaze2D(mazeSize));
  const [player, setPlayer] = useState<PlayerState>({ x: 1, y: 1, collectibles: 0, puzzlesSolved: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [assessments, setAssessments] = useState<CognitiveAssessment[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const previousPositions = useRef<{ x: number; y: number }[]>([]);

  // Initialize game metrics
  const [metrics, setMetrics] = useState<NavigationMetrics>({
    totalTime: 0,
    pathLength: 0,
    wrongTurns: 0,
    backtracks: 0,
    idleTime: 0,
    collisions: 0,
    correctTurns: 0,
    optimalPathLength: canvasWidth + canvasHeight - 2
  });

  // Add state for total collectibles
  const [totalCollectibles, setTotalCollectibles] = useState(0);

  // Modify resetLevel to count total collectibles
  const resetLevel = useCallback(() => {
    const newMazeSize = 15 + (currentLevel - 1) * 2;
    const newMaze = generateMaze2D(newMazeSize);
    setMaze(newMaze);
    
    // Count total collectibles
    let collectibleCount = 0;
    newMaze.forEach(row => {
      row.forEach(cell => {
        if (cell.isCollectible) collectibleCount++;
      });
    });
    setTotalCollectibles(collectibleCount);
    
    setPlayer({ x: 1, y: 1, collectibles: 0, puzzlesSolved: 0 });
    setGameStartTime(Date.now());
    setShowLevelComplete(false);
    setMetrics({
      totalTime: 0,
      pathLength: 0,
      wrongTurns: 0,
      backtracks: 0,
      idleTime: 0,
      collisions: 0,
      correctTurns: 0,
      optimalPathLength: newMazeSize * 2 - 2
    });
  }, [currentLevel]);

  // Initialize or reset level when currentLevel changes
  useEffect(() => {
    resetLevel();
  }, [currentLevel, resetLevel]);

  const checkCollision = useCallback((newX: number, newY: number): boolean => {
    if (newX < 0 || newX >= maze[0].length || newY < 0 || newY >= maze.length) {
      return true;
    }
    return maze[newY][newX].isWall;
  }, [maze]);

  const checkCollectible = useCallback((pos: { x: number; y: number }) => {
    if (maze[pos.y][pos.x].isCollectible) {
      const newMaze = [...maze];
      newMaze[pos.y][pos.x].isCollectible = false;
      setMaze(newMaze);
      setPlayer(prev => ({
        ...prev,
        collectibles: prev.collectibles + 1
      }));
    }
  }, [maze]);

  const updateMetrics = useCallback((newPos: {x: number, y: number}, isCollision: boolean) => {
    setMetrics(prev => ({
      ...prev,
      pathLength: prev.pathLength + 1,
      collisions: isCollision ? prev.collisions + 1 : prev.collisions
    }));
  }, []);

  useEffect(() => {
    if (completionRef.current.isCompleted && onComplete) {
      onComplete(completionRef.current.score);
    }
  }, [onComplete]);

  const handleLevelComplete = useCallback(() => {
    const finalMetrics = metrics;
    const scores = calculateCognitiveScores(finalMetrics);
    
    const newAssessment: CognitiveAssessment = {
      metrics: finalMetrics,
      scores,
      timestamp: Date.now(),
      attempt: currentLevel
    };

    setAssessments(prev => {
      const updated = [...prev, newAssessment];
      if (currentLevel >= 3) {
        setShowReport(true);
        setGameCompleted(true);
        const totalScore = updated.reduce((sum, assessment) => 
          sum + assessment.scores.overallScore, 0) / updated.length;
        completionRef.current = {
          isCompleted: true,
          score: Math.round(totalScore)
        };
        return updated;
      }
      setShowLevelComplete(true);
      return updated;
    });
  }, [currentLevel, metrics]);

  // Modify movePlayer to check for all collectibles
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (!gameStarted || gameCompleted || showLevelComplete) return;

    const newX = player.x + dx;
    const newY = player.y + dy;
    const isCollision = checkCollision(newX, newY);

    if (!isCollision) {
      setPlayer(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
      checkCollectible({ x: newX, y: newY });
      updateMetrics({ x: newX, y: newY }, false);

      // Check if player reached the end point AND has all collectibles
      if (maze[newY][newX].isEnd && player.collectibles === totalCollectibles) {
        handleLevelComplete();
      } else if (maze[newY][newX].isEnd) {
        // Show message that all collectibles are needed
        console.log("Collect all items first!");
      }
    } else {
      updateMetrics({ x: player.x, y: player.y }, true);
    }
  }, [player, gameStarted, gameCompleted, showLevelComplete, checkCollision, checkCollectible, updateMetrics, maze, handleLevelComplete, totalCollectibles]);

  const startNextLevel = useCallback(() => {
    if (currentLevel < 3) {
      setShowLevelComplete(false);
      setCurrentLevel(prev => prev + 1);
    } else {
      // Ensure report is shown for level 3
      setShowReport(true);
      setGameCompleted(true);
    }
  }, [currentLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 'KeyS':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'KeyD':
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [movePlayer]);

  // Modify the canvas drawing code for better visuals
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Add a gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvasRef.current.width, canvasRef.current.height);
    gradient.addColorStop(0, '#1a1c2c');
    gradient.addColorStop(1, '#4a1c2c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw the maze with improved visuals
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        const cellX = x * cellSize;
        const cellY = y * cellSize;

        if (cell.isWall) {
          // Wall with gradient
          const wallGradient = ctx.createLinearGradient(
            cellX, cellY,
            cellX + cellSize, cellY + cellSize
          );
          wallGradient.addColorStop(0, '#2c3e50');
          wallGradient.addColorStop(1, '#2c3e50');
          ctx.fillStyle = wallGradient;
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
          
          // Add wall highlights
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(cellX, cellY, 2, cellSize);
          ctx.fillRect(cellX, cellY, cellSize, 2);
        } else {
          // Path with subtle pattern
          ctx.fillStyle = '#34495e';
          ctx.fillRect(cellX, cellY, cellSize, cellSize);
          
          if (cell.isCollectible) {
            // Collectible with glow effect
            ctx.save();
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(
              cellX + cellSize / 2,
              cellY + cellSize / 2,
              cellSize / 4,
              0,
              Math.PI * 2
            );
            ctx.fill();
            
            // Star shape
            const spikes = 5;
            const outerRadius = cellSize / 4;
            const innerRadius = cellSize / 8;
            ctx.beginPath();
            for(let i = 0; i < spikes * 2; i++) {
              const radius = i % 2 === 0 ? outerRadius : innerRadius;
              const angle = (i * Math.PI) / spikes;
              const x = cellX + cellSize / 2 + Math.cos(angle) * radius;
              const y = cellY + cellSize / 2 + Math.sin(angle) * radius;
              if(i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fillStyle = '#ffeb3b';
            ctx.fill();
            ctx.restore();
          }

          if (cell.isEnd) {
            // Portal effect
            ctx.save();
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(cellX, cellY, cellSize, cellSize);
            
            // Animated portal effect
            const time = Date.now() / 1000;
            const numRings = 3;
            for(let i = 0; i < numRings; i++) {
              ctx.beginPath();
              ctx.arc(
                cellX + cellSize / 2,
                cellY + cellSize / 2,
                (cellSize / 3) * (1 + Math.sin(time + i) * 0.2),
                0,
                Math.PI * 2
              );
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 - i * 0.2})`;
              ctx.lineWidth = 2;
              ctx.stroke();
            }
            ctx.restore();
          }
        }
      });
    });

    // Draw player with glow effect
    ctx.save();
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
      player.x * cellSize + cellSize / 2,
      player.y * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

  }, [maze, player, cellSize]);

  // Start the game when component mounts
  useEffect(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
  }, [gameStarted]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900 p-8">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={maze[0].length * cellSize}
          height={maze.length * cellSize}
          className="rounded-lg shadow-2xl border-4 border-purple-500/30"
        />
        
        {/* Game Stats Panel */}
        <div className="absolute -top-20 right-0 bg-white/10 backdrop-blur-md p-6 rounded-t-2xl rounded-bl-2xl border border-white/20 text-white">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-purple-300 text-sm mb-1">Level</div>
              <div className="text-2xl font-bold">{currentLevel}/3</div>
            </div>
            <div className="text-center">
              <div className="text-purple-300 text-sm mb-1">Collectibles</div>
              <div className="text-2xl font-bold">{player.collectibles}/{totalCollectibles}</div>
            </div>
            <div className="text-center">
              <div className="text-purple-300 text-sm mb-1">Time</div>
              <div className="text-2xl font-bold">{Math.floor((Date.now() - (gameStartTime || Date.now())) / 1000)}s</div>
            </div>
          </div>
        </div>

        {/* Controls Guide */}
        <div className="absolute -bottom-20 left-0 right-0 bg-white/10 backdrop-blur-md p-4 rounded-b-2xl text-white text-center">
          <div className="text-sm text-purple-300 mb-2">Controls</div>
          <div className="grid grid-cols-4 gap-2 justify-center items-center">
            <div className="px-3 py-2 bg-white/5 rounded">↑</div>
            <div className="px-3 py-2 bg-white/5 rounded">↓</div>
            <div className="px-3 py-2 bg-white/5 rounded">←</div>
            <div className="px-3 py-2 bg-white/5 rounded">→</div>
          </div>
        </div>
      </div>
      
      {showLevelComplete && !showReport && currentLevel < 3 && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-white text-center max-w-md">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-6 text-purple-300">Level {currentLevel} Complete!</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-purple-300 text-sm mb-1">Collectibles</div>
                <div className="text-2xl font-bold">{player.collectibles}/{totalCollectibles}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="text-purple-300 text-sm mb-1">Time</div>
                <div className="text-2xl font-bold">{Math.floor((Date.now() - (gameStartTime || Date.now())) / 1000)}s</div>
              </div>
            </div>
            <button
              onClick={startNextLevel}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 active:scale-95"
            >
              Next Level
            </button>
          </div>
        </div>
      )}

      {(showReport || (showLevelComplete && currentLevel >= 3)) && (
        <CognitiveReport
          report={generateCognitiveReport(assessments)}
          onClose={() => {
            setShowReport(false);
            if (!completionRef.current.isCompleted && onComplete) {
              const totalScore = assessments.reduce((sum, assessment) => 
                sum + assessment.scores.overallScore, 0) / assessments.length;
              completionRef.current = {
                isCompleted: true,
                score: Math.round(totalScore)
              };
            }
          }}
        />
      )}
    </div>
  );
} 