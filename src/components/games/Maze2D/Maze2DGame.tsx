import React, { useEffect, useRef, useState, useCallback } from 'react';
import { generateMaze2D } from './mazeUtils';
import { useGameProgress } from '../../../contexts/GameProgressContext';
import { getNextGame, isLastGame } from '../../../utils/gameSeriesConfig';
import GameSubmission from '../../GameSubmission';
import { useProgress } from '../../../contexts/ProgressContext';
import { getGameNavigationInfo } from '../../../utils/gameNavigation';
import { useMetricsTracker } from '../../../hooks/useMetricsTracker';
import { BaseMetric } from '../../../types/cognitiveMetrics';

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
  onComplete?: (metrics: Record<string, BaseMetric>) => void;
}

interface Maze2DGameMetrics extends Record<string, BaseMetric> {
  Navigation_Error_Rate: BaseMetric;
  Pathfinding_Efficiency: BaseMetric;
  Completion_Time: BaseMetric;
  Collectibles_Gathered: BaseMetric;
  Correct_Turns: BaseMetric;
  Wrong_Turns: BaseMetric;
  Spatial_Problem_Solving: BaseMetric;
  Planning_Efficiency: BaseMetric;
  Cognitive_Working_Capacity: BaseMetric;
}

interface GameState {
  correctTurns: number;
  wrongTurns: number;
  collectiblesGathered: number;
  startTime: number;
  totalMoves: number;
  backtrackCount: number;
  planningTime: number;
}

export default function Maze2DGame({ cellSize = 30, onComplete }: Maze2DGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const mazeSize = 15 + (currentLevel - 1) * 2;
  const [dynamicCellSize, setDynamicCellSize] = useState(cellSize);
  
  // Calculate canvas dimensions based on dynamic cell size
  const canvasWidth = mazeSize * dynamicCellSize;
  const canvasHeight = mazeSize * dynamicCellSize;

  // Add resize handler
  useEffect(() => {
    const updateCellSize = () => {
      if (!containerRef.current) return;
      const containerSize = Math.min(
        containerRef.current.offsetWidth,
        window.innerHeight * 0.6
      );
      const newCellSize = Math.floor((containerSize - 20) / mazeSize); // Add some padding
      setDynamicCellSize(newCellSize);
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, [mazeSize]);

  const [maze, setMaze] = useState<Cell[][]>(generateMaze2D(mazeSize));
  const [player, setPlayer] = useState<PlayerState>({ x: 1, y: 1, collectibles: 0, puzzlesSolved: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const previousPositions = useRef<{ x: number; y: number }[]>([]);
  const [totalCollectibles, setTotalCollectibles] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    correctTurns: 0,
    wrongTurns: 0,
    collectiblesGathered: 0,
    startTime: Date.now(),
    totalMoves: 0,
    backtrackCount: 0,
    planningTime: 0
  });

  const { completeGame } = useGameProgress();
  const nextGame = getNextGame('maze-2d');

  const { addGameResult } = useProgress();
  const { trackMetric, metrics, submitMetrics } = useMetricsTracker('maze-2d');
  
  const gameId = 'maze-2d';
  const { nextGame: gameNavigationInfo, isLastGame: isLastGameInfo } = getGameNavigationInfo(gameId);
  const nextGamePath = gameNavigationInfo?.path || undefined;

  const [isComplete, setIsComplete] = useState(false);

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
    setGameState(prev => ({
      ...prev,
      correctTurns: 0,
      wrongTurns: 0,
      collectiblesGathered: 0,
      startTime: Date.now(),
      totalMoves: 0,
      backtrackCount: 0,
      planningTime: 0
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
      setGameState(prev => ({
        ...prev,
        collectiblesGathered: prev.collectiblesGathered + 1
      }));
    }
  }, [maze]);

  const calculateErrorRate = (): number => {
    const { correctTurns, wrongTurns } = gameState;
    const totalTurns = correctTurns + wrongTurns;
    return totalTurns > 0 ? (wrongTurns / totalTurns) * 100 : 0;
  };

  const calculateEfficiency = (): number => {
    const { correctTurns, wrongTurns, totalMoves } = gameState;
    return totalMoves > 0 ? (correctTurns / totalMoves) * 100 : 0;
  };

  const calculateSpatialProblemSolving = (): number => {
    const { correctTurns, backtrackCount, totalMoves } = gameState;
    const efficiency = correctTurns / (totalMoves || 1);
    const backtrackRatio = 1 - (backtrackCount / (totalMoves || 1));
    return (efficiency * 0.7 + backtrackRatio * 0.3) * 100;
  };

  const calculatePlanningEfficiency = (): number => {
    const { planningTime, totalMoves, correctTurns } = gameState;
    const moveEfficiency = correctTurns / (totalMoves || 1);
    const timeEfficiency = Math.max(0, 1 - (planningTime / 30000)); // 30 seconds max planning time
    return (moveEfficiency * 0.6 + timeEfficiency * 0.4) * 100;
  };

  const calculateWorkingCapacity = (): number => {
    const { collectiblesGathered, totalMoves, backtrackCount } = gameState;
    const efficiency = collectiblesGathered / (totalMoves || 1);
    const memoryScore = 1 - (backtrackCount / (totalMoves || 1));
    return (efficiency * 0.5 + memoryScore * 0.5) * 100;
  };

  const handleGameComplete = useCallback(() => {
    const endTime = Date.now();
    const gameMetrics: Maze2DGameMetrics = {
      Navigation_Error_Rate: { value: calculateErrorRate(), timestamp: endTime },
      Pathfinding_Efficiency: { value: calculateEfficiency(), timestamp: endTime },
      Completion_Time: { value: (endTime - gameStartTime) / 1000, timestamp: endTime },
      Collectibles_Gathered: { value: gameState.collectiblesGathered, timestamp: endTime },
      Correct_Turns: { value: gameState.correctTurns, timestamp: endTime },
      Wrong_Turns: { value: gameState.wrongTurns, timestamp: endTime },
      Spatial_Problem_Solving: { value: calculateSpatialProblemSolving(), timestamp: endTime },
      Planning_Efficiency: { value: calculatePlanningEfficiency(), timestamp: endTime },
      Cognitive_Working_Capacity: { value: calculateWorkingCapacity(), timestamp: endTime }
    };

    // Track metrics
    Object.entries(gameMetrics).forEach(([key, metric]) => {
      trackMetric(key, metric.value);
    });

    setIsGameComplete(true);
    onComplete?.(gameMetrics);
  }, [gameState, gameStartTime, onComplete, trackMetric, calculateErrorRate, calculateEfficiency, calculateSpatialProblemSolving, calculatePlanningEfficiency, calculateWorkingCapacity]);

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
      setGameState(prev => ({
        ...prev,
        correctTurns: prev.correctTurns + 1,
        totalMoves: prev.totalMoves + 1
      }));

      if (maze[newY][newX].isEnd && player.collectibles === totalCollectibles) {
        handleGameComplete();
      }
    } else {
      setGameState(prev => ({
        ...prev,
        wrongTurns: prev.wrongTurns + 1,
        backtrackCount: prev.backtrackCount + 1
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

    // Set canvas dimensions
    canvasRef.current.width = canvasWidth;
    canvasRef.current.height = canvasHeight;

    // Clear and redraw
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw maze
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        const cellX = x * dynamicCellSize;
        const cellY = y * dynamicCellSize;

        if (cell.isWall) {
          ctx.fillStyle = '#1a1c2c';
        } else if (cell.isStart) {
          ctx.fillStyle = '#4a9f4a';
        } else if (cell.isEnd) {
          ctx.fillStyle = '#9f4a4a';
        } else {
          ctx.fillStyle = '#ffffff';
        }

        ctx.fillRect(cellX, cellY, dynamicCellSize, dynamicCellSize);

        if (cell.isCollectible) {
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(
            cellX + dynamicCellSize / 2,
            cellY + dynamicCellSize / 2,
            dynamicCellSize / 4,
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
      player.x * dynamicCellSize + dynamicCellSize / 2,
      player.y * dynamicCellSize + dynamicCellSize / 2,
      dynamicCellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [maze, player, dynamicCellSize, canvasWidth, canvasHeight]);

  const handleSubmit = async () => {
    if (!metrics) return;
    await submitMetrics();
    addGameResult(gameId, metrics);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] py-4 px-4 bg-gradient-to-b from-blue-100 to-purple-100">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2 text-blue-800">Maze Navigator</h1>
        
        <div className="mb-2 text-center">
          <div className="text-base mb-1">
            Collectibles: {player.collectibles}/{totalCollectibles}
          </div>
          <div className="text-sm text-gray-600">
            Use arrow keys or WASD to move
          </div>
        </div>

        <div ref={containerRef} className="w-full max-w-[min(80vw,60vh)] aspect-square p-2 bg-white rounded-lg shadow-lg">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{
              width: '100%',
              height: '100%',
              display: 'block'
            }}
          />
        </div>

        <GameSubmission
          isComplete={isGameComplete}
          onSubmit={handleSubmit}
          gameMetrics={metrics || {}}
          nextGame={nextGamePath}
          isLastGame={isLastGameInfo}
          currentGameId={gameId}
        />
      </div>
    </div>
  );
} 