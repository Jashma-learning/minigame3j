import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameDataService } from './services/gameDataService';
import { GameSession, GameMetrics, UserData } from './types/gameData';
import metricsRouter from './routes/metrics';
import stroopMetricsRouter from './routes/stroopMetrics';
import cognitiveRoutes from './routes/cognitiveRoutes';
import mazeRoutes from './routes/mazeRoutes';

// Load environment variables
dotenv.config();

const app = express();
const router = express.Router();
const port = process.env.PORT || 3001;
const gameDataService = new GameDataService();

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true
};

// Custom types for request parameters
interface MetricsRequestParams {
  gameId: string;
  userId?: string;
}

interface MetricsRequestBody {
  userId: string;
  metrics: GameMetrics;
  cognitiveMetrics: Record<string, number>;
}

interface StoreUserDataBody {
  userId: string;
  userData: Omit<UserData, 'createdAt' | 'lastUpdated'>;
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount metrics routers
app.use('/api', metricsRouter);
app.use('/api', stroopMetricsRouter);

// Register the cognitive routes
app.use('/api/cognitive', cognitiveRoutes);

// Register routes
app.use('/api', metricsRouter);
app.use('/api', stroopMetricsRouter);
app.use('/api', cognitiveRoutes);
app.use('/api/maze', mazeRoutes);

// Root route
app.get('/', (_req, res) => {
  res.json({ message: 'Cognitive Assessment Games API is running' });
});

// API routes
app.use('/api', router);

// Store user data
router.post('/user-data', async (req, res) => {
  try {
    const userData: UserData = req.body.userData;
    const userId = await gameDataService.storeUserData(userData);
    res.json({ success: true, userId });
  } catch (error) {
    console.error('Error storing user data:', error);
    res.status(500).json({ success: false, error: 'Failed to store user data' });
  }
});

// Get user profile
router.get('/user-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userProfile = await gameDataService.getUserProfile(userId);
    if (!userProfile) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, data: userProfile });
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve user profile' });
  }
});

// Store game metrics
router.post('/metrics/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId, metrics, cognitiveMetrics } = req.body;

    if (!userId || !metrics) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: userId and metrics'
      });
      return;
    }

    const gameSession: GameSession = {
      gameId,
      timestamp: Date.now(),
      metrics
    };

    await gameDataService.storeGameSession(userId, gameSession, cognitiveMetrics);

    res.json({
      success: true,
      message: `Metrics stored for game ${gameId}`,
      data: gameSession
    });
  } catch (error) {
    console.error('Error storing metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store metrics'
    });
  }
});

// Get user's game metrics
router.get('/metrics/:userId/:gameId?', async (req, res) => {
  try {
    const { userId, gameId } = req.params;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: userId'
      });
      return;
    }

    let data;
    if (gameId) {
      data = await gameDataService.getGameSpecificData(userId, gameId);
    } else {
      data = await gameDataService.getUserGameData(userId);
    }

    if (!data) {
      res.status(404).json({
        success: false,
        error: 'No data found'
      });
      return;
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error retrieving metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics'
    });
  }
});

// Get user's cognitive profile
router.get('/cognitive-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await gameDataService.getCognitiveProfile(userId);

    if (!profile) {
      res.status(404).json({
        success: false,
        error: 'No cognitive profile found'
      });
      return;
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error retrieving cognitive profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cognitive profile'
    });
  }
});

// Get all users
router.get('/users', async (_req, res) => {
  try {
    const users = await gameDataService.getAllUsers();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 