import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface MazeGrid {
  id: string;
  size: {
    width: number;
    height: number;
  };
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
  walls: Array<{
    x: number;
    y: number;
  }>;
  optimalPathLength: number;
  algorithm?: string;
  algorithmParams?: {
    seed: number;
    complexity: number;
  };
}

interface DifficultySettings {
  timeLimit: number;
  hintsAllowed: number;
  fogOfWar: boolean;
  visibilityRadius?: number;
  movingObstacles?: boolean;
}

interface GridResponse {
  grid: MazeGrid;
  settings: DifficultySettings;
}

interface GridsByDifficultyResponse {
  grids: MazeGrid[];
  settings: DifficultySettings;
}

/**
 * Fetches all available maze grids
 */
export const getAllGrids = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/maze/grids`);
    return response.data;
  } catch (error) {
    console.error('Error fetching maze grids:', error);
    throw error;
  }
};

/**
 * Fetches maze grids for a specific difficulty level
 * @param difficulty - The difficulty level ('easy', 'medium', 'hard')
 */
export const getGridsByDifficulty = async (difficulty: string): Promise<GridsByDifficultyResponse> => {
  try {
    const response = await axios.get(`${API_URL}/maze/grids/difficulty/${difficulty}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching maze grids for difficulty ${difficulty}:`, error);
    throw error;
  }
};

/**
 * Fetches a specific maze grid by ID
 * @param id - The ID of the maze grid
 */
export const getGridById = async (id: string): Promise<GridResponse> => {
  try {
    const response = await axios.get(`${API_URL}/maze/grids/id/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching maze grid with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetches settings for a specific difficulty level
 * @param difficulty - The difficulty level ('easy', 'medium', 'hard')
 */
export const getDifficultySettings = async (difficulty: string): Promise<DifficultySettings> => {
  try {
    const response = await axios.get(`${API_URL}/maze/settings/${difficulty}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching settings for difficulty ${difficulty}:`, error);
    throw error;
  }
}; 