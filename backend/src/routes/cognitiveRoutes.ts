import express from 'express';
import * as stroopController from '../controllers/stroopMetricsController';
import * as maze2dController from '../controllers/maze2dMetricsController';

const router = express.Router();

// Stroop routes
router.post('/stroop/metrics/:userId', stroopController.storeStroopMetrics);
router.get('/stroop/profile/:userId', stroopController.getStroopCognitiveProfile);
router.get('/stroop/stats', stroopController.getStroopAggregateStats);

// Maze2D routes
router.post('/maze2d/metrics/:userId', maze2dController.storeMetrics);
router.get('/maze2d/profile/:userId', maze2dController.getCognitiveProfile);
router.get('/maze2d/stats', maze2dController.getAggregateStats);

export default router; 