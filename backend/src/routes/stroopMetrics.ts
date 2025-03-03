import express, { Request, Response } from 'express';
import { 
  storeStroopMetrics, 
  getStroopCognitiveProfile, 
  getStroopAggregateStats 
} from '../controllers/stroopMetricsController';

// Create a router
const router = express.Router();

// POST endpoint to store Stroop metrics for a user
router.post('/metrics/stroop/:userId', async (req: Request, res: Response) => {
  await storeStroopMetrics(req, res);
});

// GET endpoint to retrieve a user's cognitive profile for Stroop
router.get('/cognitive-profile/stroop/:userId', async (req: Request, res: Response) => {
  await getStroopCognitiveProfile(req, res);
});

// GET endpoint to retrieve aggregate statistics for Stroop
router.get('/aggregate-stats/stroop', async (req: Request, res: Response) => {
  await getStroopAggregateStats(req, res);
});

export default router; 