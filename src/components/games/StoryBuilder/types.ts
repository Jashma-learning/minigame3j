export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameState = 'intro' | 'playing' | 'feedback' | 'complete';

export interface StoryTemplate {
  template: string;
  wordBank: string[];
  correctWords: string[];
  theme: string;
  difficulty: Difficulty;
}

export interface Word {
  id: string;
  text: string;
  isSelected: boolean;
}

export interface StoryDisplayProps {
  template: string;
  selectedWords: string[];
  onWordClick: (word: string) => void;
}

export interface WordBankProps {
  availableWords: string[];
  selectedWords: string[];
  onWordSelect: (word: string) => void;
} 