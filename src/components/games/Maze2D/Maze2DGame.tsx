import React, { useEffect, useRef, useState, useCallback } from 'react';
import { generateMaze2D } from './mazeUtils';
import { useGameProgress } from '../../../contexts/GameProgressContext';
import { getNextGame, isLastGame } from '../../../utils/gameSeriesConfig';
import GameSubmission from '../../GameSubmission';
import { Maze2DMetrics } from '../../../types/metrics';

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
  cellSize?: number;
  onComplete?: (metrics: Maze2DMetrics) => void;
}

export default function Maze2DGame({ cellSize = 30, onComplete }: Maze2DGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const mazeSize = 15 + (currentLevel - 1) * 2;
  const canvasWidth = mazeSize * cellSize;
  const canvasHeight = mazeSize * cellSize;
  
  const [maze, setMaze] = useState<Cell[][]>(generateMaze2D(mazeSize));
  const [player, setPlayer] = useState<PlayerState>({ x: 1, y: 1, collectibles: 0, puzzlesSolved: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const previousPositions = useRef<{ x: number; y: number }[]>([]);
  const [totalCollectibles, setTotalCollectibles] = useState(0);
  const [gameMetrics, setGameMetrics] = useState<Maze2DMetrics>({
    totalTime: 0,
    pathLength: 0,
    wrongTurns: 0,
    backtracks: 0,
    idleTime: 0,
    collisions: 0,
    correctTurns: 0,
    collectiblesGathered: 0,
    totalCollectibles: 0,
    completionTime: 0,
    accuracy: 0
  });

  const { completeGame } = useGameProgress();
  const nextGame = getNextGame('maze-2d');

  const resetLevel = useCallback(() => {
    const newMazeSize = 15 + (currentLevel - 1) * 2;
    const newMaze = generateMaze2D(newMazeSize);
    setMaze(newMaze);
    
    let collectibleCount = 0;
    newMaze.forEach(row => {
      row.forEach(cell => {
        if (cell.isCollectible) collectibleCount++;
      });
    });
    setTotalCollectibles(collectibleCount);
    
    setPlayer({ x: 1, y: 1, collectibles: 0, puzzlesSolved: 0 });
    setGameStartTime(Date.now());
    setGameMetrics(prev => ({
      ...prev,
      totalCollectibles: collectibleCount,
      collectiblesGathered: 0,
      pathLength: 0,
      collisions: 0
    }));
  }, [currentLevel]);

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
      setGameMetrics(prev => ({
        ...prev,
        collectiblesGathered: prev.collectiblesGathered + 1
      }));
    }
  }, [maze]);

  const handleGameComplete = useCallback(() => {
    const endTime = Date.now();
    const finalMetrics: Maze2DMetrics = {
      ...gameMetrics,
      completionTime: gameStartTime ? (endTime - gameStartTime) / 1000 : 0,
      accuracy: (gameMetrics.correctTurns / (gameMetrics.correctTurns + gameMetrics.wrongTurns)) * 100
    };
    
    setGameMetrics(finalMetrics);
    setIsGameComplete(true);
    onComplete?.(finalMetrics);
  }, [gameMetrics, gameStartTime, onComplete]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (!gameStarted || isGameComplete) return;

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
      setGameMetrics(prev => ({
        ...prev,
        pathLength: prev.pathLength + 1,
        correctTurns: prev.correctTurns + 1
      }));

      if (maze[newY][newX].isEnd && player.collectibles === totalCollectibles) {
        handleGameComplete();
      }
    } else {
      setGameMetrics(prev => ({
        ...prev,
        collisions: prev.collisions + 1,
        wrongTurns: prev.wrongTurns + 1
      }));
    }
  }, [player, gameStarted, isGameComplete, checkCollision, checkCollectible, maze, handleGameComplete, totalCollectibles]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) {
        setGameStarted(true);
        setGameStartTime(Date.now());
      }
      
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
  }, [movePlayer, gameStarted]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw maze
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        const cellX = x * cellSize;
        const cellY = y * cellSize;

        if (cell.isWall) {
          ctx.fillStyle = '#1a1c2c';
        } else if (cell.isStart) {
          ctx.fillStyle = '#4a9f4a';
        } else if (cell.isEnd) {
          ctx.fillStyle = '#9f4a4a';
        } else {
          ctx.fillStyle = '#ffffff';
        }

        ctx.fillRect(cellX, cellY, cellSize, cellSize);

        if (cell.isCollectible) {
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
        }
      });
    });

    // Draw player
    ctx.fillStyle = '#4a4af0';
    ctx.beginPath();
    ctx.arc(
      player.x * cellSize + cellSize / 2,
      player.y * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [maze, player, cellSize, canvasWidth, canvasHeight]);

  const handleGameSubmit = () => {
    completeGame('maze-2d', gameMetrics);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-100 to-purple-100">
      <h1 className="text-4xl font-bold mb-4 text-blue-800">Maze Navigator</h1>
      
      <div className="mb-4 text-center">
        <div className="text-lg mb-2">
          Collectibles: {player.collectibles}/{totalCollectibles}
        </div>
        <div className="text-sm text-gray-600">
          Use arrow keys or WASD to move
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border-4 border-blue-300 rounded-lg shadow-lg bg-white"
      />

      <GameSubmission
        isComplete={isGameComplete}
        onSubmit={handleGameSubmit}
        gameMetrics={gameMetrics}
        nextGame={nextGame?.path}
        isLastGame={isLastGame('maze-2d')}
      />
    </div>
  );
} 