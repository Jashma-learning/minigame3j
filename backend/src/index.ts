import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameDataService } from './services/gameDataService';
import { GameSession } from './types/gameData';

// Load environment variables
dotenv.config();

const app = express();
const router = Router();
const port = process.env.PORT || 3001;
const gameDataService = new GameDataService();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Cognitive Assessment Games API' });
});

// Store game metrics
router.post('/api/metrics/:gameId', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { userId, metrics } = req.body;

    if (!userId || !metrics) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId and metrics'
      });
    }

    const gameSession: GameSession = {
      gameId,
      timestamp: Date.now(),
      metrics
    };

    gameDataService.storeGameSession(userId, gameSession);

    res.json({
      success: true,
      message: `Metrics stored for game ${gameId}`,
      data: gameSession
    });
  } catch (error) {
    console.error('Error storing metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error storing metrics'
    });
  }
});

// Get user's game metrics
router.get('/api/metrics/:userId/:gameId?', (req: Request, res: Response) => {
  try {
    const { userId, gameId } = req.params;
    
    let data;
    if (gameId) {
      data = gameDataService.getGameData(userId, gameId);
    } else {
      data = gameDataService.getUserData(userId);
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'No data found'
      });
    }

    res.json({
      success: true,
      message: gameId 
        ? `Retrieved metrics for game ${gameId}`
        : `Retrieved all metrics for user`,
      data
    });
  } catch (error) {
    console.error('Error retrieving metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving metrics'
    });
  }
});

// Get all users
router.get('/api/users', (req: Request, res: Response) => {
  try {
    const users = gameDataService.getAllUsers();
    res.json({
      success: true,
      message: 'Retrieved all users',
      data: users
    });
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users'
    });
  }
});

// Use router
app.use(router);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 