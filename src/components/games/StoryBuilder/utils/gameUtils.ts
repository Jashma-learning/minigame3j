import { StoryTemplate, Difficulty } from '../types';
import { wordList } from './wordList';

const storyTemplates: Record<Difficulty, StoryTemplate[]> = {
  easy: [
    {
      template: 'Once upon a time, there was a __BLANK1__ who loved to __BLANK2__. Every day, they would go to the __BLANK3__ and __BLANK4__ with their __BLANK5__.',
      wordBank: ['cat', 'dance', 'park', 'play', 'friend', 'sing', 'garden', 'jump', 'ball', 'book'],
      correctWords: ['cat', 'dance', 'park', 'play', 'friend'],
      theme: 'animals',
      difficulty: 'easy'
    },
    {
      template: 'The __BLANK1__ was very __BLANK2__ because they found a __BLANK3__ in the __BLANK4__ while __BLANK5__.',
      wordBank: ['dog', 'happy', 'toy', 'house', 'running', 'sad', 'bone', 'yard', 'sleeping', 'walking'],
      correctWords: ['dog', 'happy', 'toy', 'house', 'running'],
      theme: 'emotions',
      difficulty: 'easy'
    }
  ],
  medium: [
    {
      template: 'During the __BLANK1__ adventure, the brave __BLANK2__ discovered a __BLANK3__ that could __BLANK4__ through the __BLANK5__ mountains.',
      wordBank: ['magical', 'explorer', 'map', 'fly', 'misty', 'dangerous', 'warrior', 'compass', 'travel', 'snowy'],
      correctWords: ['magical', 'explorer', 'map', 'fly', 'misty'],
      theme: 'adventure',
      difficulty: 'medium'
    },
    {
      template: 'The __BLANK1__ scientist __BLANK2__ an amazing __BLANK3__ that could __BLANK4__ any __BLANK5__ into gold.',
      wordBank: ['brilliant', 'invented', 'machine', 'transform', 'object', 'clever', 'created', 'potion', 'change', 'metal'],
      correctWords: ['brilliant', 'invented', 'machine', 'transform', 'object'],
      theme: 'science',
      difficulty: 'medium'
    }
  ],
  hard: [
    {
      template: 'In the __BLANK1__ depths of the __BLANK2__ ocean, a __BLANK3__ civilization __BLANK4__ secrets of __BLANK5__ technology.',
      wordBank: ['mysterious', 'ancient', 'lost', 'discovered', 'advanced', 'unexplored', 'deep', 'forgotten', 'unlocked', 'futuristic'],
      correctWords: ['mysterious', 'ancient', 'lost', 'discovered', 'advanced'],
      theme: 'mystery',
      difficulty: 'hard'
    },
    {
      template: 'The __BLANK1__ expedition to the __BLANK2__ planet revealed __BLANK3__ forms of __BLANK4__ that __BLANK5__ our understanding of life.',
      wordBank: ['interstellar', 'distant', 'extraordinary', 'intelligence', 'transformed', 'cosmic', 'alien', 'unique', 'challenged', 'life'],
      correctWords: ['interstellar', 'distant', 'extraordinary', 'intelligence', 'transformed'],
      theme: 'space',
      difficulty: 'hard'
    }
  ]
};

export const generateStoryTemplate = (difficulty: Difficulty): StoryTemplate => {
  const templates = storyTemplates[difficulty];
  const randomIndex = Math.floor(Math.random() * templates.length);
  const template = templates[randomIndex];
  
  // Add some random words from the word list based on difficulty
  const additionalWords = getRandomWords(difficulty);
  const wordBank = [...new Set([...template.wordBank, ...additionalWords])];
  
  return {
    ...template,
    wordBank: shuffleArray(wordBank)
  };
};

const getRandomWords = (difficulty: Difficulty): string[] => {
  const count = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
  const words = shuffleArray([...wordList]);
  return words.slice(0, count);
};

export const calculateScore = (
  correctWords: number,
  timeBonus: number,
  hintsLeft: number,
  difficulty: Difficulty
): number => {
  const baseScore = correctWords * 100;
  const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
  const timeMultiplier = Math.max(0, timeBonus) / 60; // Convert seconds to minutes
  const hintBonus = hintsLeft * 50;

  return Math.round((baseScore * difficultyMultiplier) + (timeMultiplier * 100) + hintBonus);
};

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}; 