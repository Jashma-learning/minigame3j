import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import StoryDisplay from './components/StoryDisplay';
import WordBank from './components/WordBank';
import { generateStoryTemplate, calculateScore } from './utils/gameUtils';
import { StoryTemplate, GameState, Difficulty } from './types';

interface StoryBuilderGameProps {
  onComplete: (score: number) => void;
}

const INITIAL_CONFIG = {
  timeLimit: 180, // 3 minutes per story
  minWordsToComplete: 5,
  maxHints: 3,
};

const StoryBuilderGame: React.FC<StoryBuilderGameProps> = ({ onComplete }) => {
  const router = useRouter();
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [timeLeft, setTimeLeft] = useState(INITIAL_CONFIG.timeLimit);
  const [hintsLeft, setHintsLeft] = useState(INITIAL_CONFIG.maxHints);
  const [currentStory, setCurrentStory] = useState<StoryTemplate | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>('intro');
  const [feedback, setFeedback] = useState<string>('');
  const [allStoriesCompleted, setAllStoriesCompleted] = useState(false);

  const startGame = useCallback(() => {
    const newStory = generateStoryTemplate(difficulty);
    setCurrentStory(newStory);
    setGameStarted(true);
    setGameState('playing');
    setTimeLeft(INITIAL_CONFIG.timeLimit);
    setHintsLeft(INITIAL_CONFIG.maxHints);
    setSelectedWords([]);
  }, [difficulty]);

  const handleWordSelect = useCallback((word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(prev => prev.filter(w => w !== word));
    } else {
      setSelectedWords(prev => [...prev, word]);
    }
  }, [selectedWords]);

  const useHint = useCallback(() => {
    if (hintsLeft > 0 && currentStory) {
      setHintsLeft(prev => prev - 1);
      // Reveal a correct word placement
      const unusedCorrectWord = currentStory.correctWords.find(
        word => !selectedWords.includes(word)
      );
      if (unusedCorrectWord) {
        setSelectedWords(prev => [...prev, unusedCorrectWord]);
      }
    }
  }, [hintsLeft, currentStory, selectedWords]);

  const submitStory = useCallback(() => {
    if (!currentStory) return;

    const correctWordsCount = selectedWords.filter(word => 
      currentStory.correctWords.includes(word)
    ).length;

    const isCorrect = correctWordsCount >= INITIAL_CONFIG.minWordsToComplete;
    const timeBonus = Math.max(0, timeLeft);
    const roundScore = calculateScore(correctWordsCount, timeBonus, hintsLeft, difficulty);

    setScore(prev => prev + roundScore);
    setFeedback(isCorrect ? 'Great job! Your story is creative!' : 'Keep trying! You can make it even better!');
    setGameState('feedback');

    setTimeout(() => {
      if (difficulty === 'hard') {
        setGameState('complete');
        setAllStoriesCompleted(true);
        onComplete(score + roundScore);
      } else {
        // Progress to next difficulty
        setDifficulty(prev => prev === 'easy' ? 'medium' : 'hard');
        startGame();
      }
    }, 3000);
  }, [currentStory, selectedWords, timeLeft, hintsLeft, difficulty, score, onComplete]);

  const handleFinalSubmit = () => {
    router.push('/report');
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitStory();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStarted, gameState, timeLeft, submitStory]);

  return (
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col items-center justify-start p-4 bg-violet-900 rounded-lg overflow-y-auto">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2 text-white">Story Builder</h1>
        {gameStarted && (
          <div className="flex gap-4 justify-center">
            <div className="px-4 py-2 bg-violet-600 rounded-lg">
              Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="px-4 py-2 bg-violet-600 rounded-lg">
              Score: {score}
            </div>
            <div className="px-4 py-2 bg-violet-600 rounded-lg">
              Hints: {hintsLeft}
            </div>
          </div>
        )}
      </div>

      {gameState === 'intro' && (
        <div className="flex flex-col items-center justify-center mt-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-violet-600 p-6 rounded-xl text-center mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to Story Builder!</h2>
            <p className="text-gray-200 mb-4">
              Create amazing stories by choosing the right words to fill in the blanks.
              The more creative your story, the higher your score!
            </p>
            <button
              onClick={() => startGame()}
              className="px-6 py-3 bg-green-500 text-white rounded-lg text-xl hover:bg-green-600 transition-colors"
            >
              Start Building!
            </button>
          </motion.div>
        </div>
      )}

      {gameState === 'playing' && currentStory && (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
          <StoryDisplay
            template={currentStory.template}
            selectedWords={selectedWords}
            onWordClick={handleWordSelect}
          />

          <WordBank
            availableWords={currentStory.wordBank}
            selectedWords={selectedWords}
            onWordSelect={handleWordSelect}
          />

          <div className="flex justify-between">
            <button
              onClick={useHint}
              disabled={hintsLeft === 0}
              className={`px-4 py-2 rounded-lg transition-colors ${
                hintsLeft > 0
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              Use Hint ({hintsLeft} left)
            </button>

            <button
              onClick={submitStory}
              disabled={selectedWords.length < INITIAL_CONFIG.minWordsToComplete}
              className={`px-6 py-2 rounded-lg transition-colors ${
                selectedWords.length >= INITIAL_CONFIG.minWordsToComplete
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              Submit Story
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {gameState === 'feedback' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
          >
            <div className="bg-violet-900 p-6 rounded-xl text-center">
              <h3 className="text-xl font-bold text-white mb-2">{feedback}</h3>
              <p className="text-violet-200 mb-4">Score: {score}</p>
              {allStoriesCompleted && (
                <button
                  onClick={handleFinalSubmit}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors mt-4"
                >
                  View Full Report
                </button>
              )}
            </div>
          </motion.div>
        )}

        {gameState === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
          >
            <div className="bg-violet-900 p-8 rounded-xl text-center max-w-md">
              <h2 className="text-2xl font-bold text-white mb-4">Congratulations!</h2>
              <p className="text-violet-200 mb-6">You've completed all the stories!</p>
              <p className="text-2xl font-bold text-violet-200 mb-6">Final Score: {score}</p>
              <button
                onClick={handleFinalSubmit}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-lg font-medium"
              >
                View Full Report
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoryBuilderGame; 