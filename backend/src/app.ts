import express from 'express';
import cors from 'cors';
import metricsRouter from './routes/metrics';
import goNoGoMetricsRouter from './routes/goNoGoMetrics';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/metrics', metricsRouter);
app.use('/api/metrics/go-no-go', goNoGoMetricsRouter);

// Test endpoint
app.post('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

export default app; 