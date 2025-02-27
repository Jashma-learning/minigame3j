import React, { useState, useEffect } from 'react';
import Card from './Card';
import { soundEffect } from '@/utils/sound';

// Game icons (emojis) for cards
const ICONS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];

interface GameConfig {
  gridSize: number;
  timeLimit: number | null;
}

interface GameStats {
  bestMoves: number;
  bestTime: number;
  gamesPlayed: number;
}

interface MemoryMatchGameProps {
  onComplete: (score: number) => void;
}

const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onComplete }) => {
  const [cards, setCards] = useState<Array<{ id: number; icon: string; isFlipped: boolean; isMatched: boolean }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    gridSize: 4, // 4x4 grid
    timeLimit: 60, // 60 seconds default time limit
  });
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    bestMoves: Infinity,
    bestTime: Infinity,
    gamesPlayed: 0,
  });
  const [showCongrats, setShowCongrats] = useState<boolean>(false);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [gameConfig.gridSize]);

  // Timer logic
  useEffect(() => {
    if (gameStarted && gameConfig.timeLimit && timeLeft !== null) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        endGame(false);
      }
    }
  }, [timeLeft, gameStarted]);

  const initializeGame = () => {
    const pairs = Math.floor((gameConfig.gridSize * gameConfig.gridSize) / 2);
    const selectedIcons = ICONS.slice(0, pairs);
    const cardPairs = [...selectedIcons, ...selectedIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(cardPairs);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameStarted(true);
    setShowCongrats(false);
    if (gameConfig.timeLimit) {
      setTimeLeft(gameConfig.timeLimit);
    }
  };

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) return;
    
    // Prevent clicking if two cards are already flipped
    if (flippedCards.length === 2) return;
    
    // Prevent clicking the same card twice
    if (flippedCards.includes(cardId)) return;
    
    // Prevent clicking matched cards
    if (cards[cardId].isMatched) return;

    soundEffect.playCardFlip();

    const newCards = [...cards];
    newCards[cardId].isFlipped = true;
    setCards(newCards);
    
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      checkForMatch(newFlippedCards);
    }
  };

  const checkForMatch = (currentFlippedCards: number[]) => {
    const [first, second] = currentFlippedCards;
    
    setTimeout(() => {
      if (cards[first].icon === cards[second].icon) {
        soundEffect.playMatch();
        const newCards = [...cards];
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setMatches(matches + 1);
        
        // Check for game completion
        if (matches + 1 === cards.length / 2) {
          endGame(true);
        }
      } else {
        soundEffect.playNoMatch();
        const newCards = [...cards];
        newCards[first].isFlipped = false;
        newCards[second].isFlipped = false;
        setCards(newCards);
      }
      setFlippedCards([]);
    }, 1000);
  };

  const calculateScore = () => {
    const timeSpent = gameConfig.timeLimit! - (timeLeft ?? 0);
    const baseScore = 1000;
    const timeBonus = Math.max(0, 30 - timeSpent) * 10;
    const movesPenalty = Math.max(0, moves - cards.length) * 5;
    return Math.max(0, baseScore + timeBonus - movesPenalty);
  };

  const endGame = (won: boolean) => {
    setGameStarted(false);
    if (won) {
      const score = calculateScore();
      const timeSpent = gameConfig.timeLimit! - (timeLeft ?? 0);
      setGameStats(prev => ({
        bestMoves: Math.min(prev.bestMoves, moves),
        bestTime: Math.min(prev.bestTime, timeSpent),
        gamesPlayed: prev.gamesPlayed + 1,
      }));
      setShowCongrats(true);
      onComplete(score);
    }
  };

  const increaseDifficulty = () => {
    if (gameConfig.gridSize < 6) { // Max 6x6 grid
      setGameConfig({
        ...gameConfig,
        gridSize: gameConfig.gridSize + 2,
        timeLimit: Math.max(30, gameConfig.timeLimit! - 15), // Reduce time but minimum 30 seconds
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-white">Memory Match</h1>
        <div className="flex gap-4 mb-4">
          <div className="px-4 py-2 bg-blue-100 rounded text-blue-900">Moves: {moves}</div>
          <div className="px-4 py-2 bg-green-100 rounded text-green-900">Matches: {matches}</div>
          {timeLeft !== null && (
            <div className={`px-4 py-2 rounded ${timeLeft < 10 ? 'bg-red-100 text-red-900' : 'bg-yellow-100 text-yellow-900'}`}>
              Time: {timeLeft}s
            </div>
          )}
        </div>
        
        {/* Stats Display */}
        {gameStats.gamesPlayed > 0 && (
          <div className="text-sm text-gray-300 mb-4">
            <div>Best Moves: {gameStats.bestMoves === Infinity ? '-' : gameStats.bestMoves}</div>
            <div>Best Time: {gameStats.bestTime === Infinity ? '-' : `${gameStats.bestTime}s`}</div>
            <div>Games Played: {gameStats.gamesPlayed}</div>
          </div>
        )}
      </div>

      {/* Congratulations Modal */}
      {showCongrats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">🎉 Congratulations! 🎉</h2>
            <p>You completed the puzzle in {moves} moves!</p>
            <p className="mt-2">Score: {calculateScore()}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => setShowCongrats(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div 
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${gameConfig.gridSize}, minmax(0, 1fr))`,
        }}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            {...card}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>

      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={initializeGame}
        >
          New Game
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          onClick={increaseDifficulty}
          disabled={gameConfig.gridSize >= 6}
        >
          Increase Difficulty
        </button>
      </div>
    </div>
  );
};

export default MemoryMatchGame; 