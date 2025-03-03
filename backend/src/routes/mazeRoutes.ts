import express from 'express';
import { 
  getAllGrids, 
  getGridsByDifficulty, 
  getGridById,
  getDifficultySettings
} from '../controllers/mazeGridController';

const router = express.Router();

// Get all available maze grids
router.get('/grids', getAllGrids);

// Get maze grids for a specific difficulty level
router.get('/grids/difficulty/:difficulty', getGridsByDifficulty);

// Get a specific maze grid by ID
router.get('/grids/id/:id', getGridById);

// Get settings for a specific difficulty level
router.get('/settings/:difficulty', getDifficultySettings);

export default router; 