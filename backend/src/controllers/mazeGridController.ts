import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const GRIDS_FILE = path.join(__dirname, '../../data/maze2dGrids.json');

/**
 * Reads the maze grid layouts from the JSON file
 */
async function readGridData() {
  try {
    const data = await fs.readFile(GRIDS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading maze grid data:', error);
    throw new Error('Failed to read maze grid data');
  }
}

/**
 * Get all available maze grid layouts
 */
export const getAllGrids = async (req: Request, res: Response) => {
  try {
    const gridData = await readGridData();
    res.status(200).json(gridData);
  } catch (error) {
    console.error('Error retrieving maze grids:', error);
    res.status(500).json({ error: 'Failed to retrieve maze grids' });
  }
};

/**
 * Get maze grid layouts for a specific difficulty level
 */
export const getGridsByDifficulty = async (req: Request, res: Response) => {
  try {
    const { difficulty } = req.params;
    const gridData = await readGridData();
    
    if (!gridData.grids[difficulty]) {
      return res.status(404).json({ error: `No grids found for difficulty: ${difficulty}` });
    }
    
    res.status(200).json({
      grids: gridData.grids[difficulty],
      settings: gridData.difficultySettings[difficulty]
    });
  } catch (error) {
    console.error('Error retrieving maze grids by difficulty:', error);
    res.status(500).json({ error: 'Failed to retrieve maze grids' });
  }
};

/**
 * Get a specific maze grid by its ID
 */
export const getGridById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gridData = await readGridData();
    
    // Search for the grid with the specified ID across all difficulty levels
    for (const difficulty in gridData.grids) {
      const grid = gridData.grids[difficulty].find((g: any) => g.id === id);
      if (grid) {
        return res.status(200).json({
          grid,
          settings: gridData.difficultySettings[difficulty]
        });
      }
    }
    
    return res.status(404).json({ error: `Grid with ID ${id} not found` });
  } catch (error) {
    console.error('Error retrieving maze grid by ID:', error);
    res.status(500).json({ error: 'Failed to retrieve maze grid' });
  }
};

/**
 * Get settings for a specific difficulty level
 */
export const getDifficultySettings = async (req: Request, res: Response) => {
  try {
    const { difficulty } = req.params;
    const gridData = await readGridData();
    
    if (!gridData.difficultySettings[difficulty]) {
      return res.status(404).json({ error: `No settings found for difficulty: ${difficulty}` });
    }
    
    res.status(200).json(gridData.difficultySettings[difficulty]);
  } catch (error) {
    console.error('Error retrieving difficulty settings:', error);
    res.status(500).json({ error: 'Failed to retrieve difficulty settings' });
  }
}; 