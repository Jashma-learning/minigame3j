import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';

// Type definitions for metrics
interface MetricValue {
  accuracy: number;
  reactionTime: number;
  span: number;
  errorRate: number;
}

interface AttentionMetrics {
  focusScore: number;
  consistency: number;
  deliberationTime: number;
}

interface ProcessingMetrics {
  cognitiveLoad: number;
  processingSpeed: number;
  efficiency: number;
}

interface OverallMetrics {
  performanceScore: number;
  confidenceLevel: number;
  percentileRank: number;
}

interface CognitiveMetrics {
  memory: MetricValue;
  attention: AttentionMetrics;
  processing: ProcessingMetrics;
  overall: OverallMetrics;
}

interface EnvironmentFactors {
  timeOfDay: number;
  dayOfWeek: number;
  completionTime: number;
}

interface Assessment {
  timestamp: number;
  metrics: CognitiveMetrics;
  sessionId: string;
  environmentFactors: EnvironmentFactors;
}

interface CognitiveProfile {
  baseline: CognitiveMetrics | null;
  trend: Array<{
    timestamp: number;
    metrics: MetricValue | AttentionMetrics | ProcessingMetrics | OverallMetrics;
  }>;
}

interface UserProfile {
  assessments: Assessment[];
  cognitiveProfile: {
    memory: CognitiveProfile;
    attention: CognitiveProfile;
    processing: CognitiveProfile;
    overall: CognitiveProfile;
  };
}

interface AggregateStats {
  totalAssessments: number;
  averageScores: {
    memory: MetricValue;
    attention: AttentionMetrics;
    processing: ProcessingMetrics;
    overall: OverallMetrics;
  };
}

interface MemoryMatchData {
  users: Record<string, UserProfile>;
  aggregateStats: AggregateStats;
}

const router = express.Router();
const COGNITIVE_DATA_DIR = path.join(__dirname, '../data/cognitive');
const MEMORY_MATCH_FILE = path.join(COGNITIVE_DATA_DIR, 'memory_match.json');

// Statistical helper functions
const calculateMean = (numbers: number[]): number => 
  numbers.reduce((sum, n) => sum + n, 0) / numbers.length;

const calculateStandardDeviation = (numbers: number[]): number => {
  const mean = calculateMean(numbers);
  const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
  return Math.sqrt(variance);
};

// Ensure cognitive data directory exists
const ensureCognitiveDirectory = async (): Promise<void> => {
  try {
    // Create directory if it doesn't exist
    await fs.mkdir(COGNITIVE_DATA_DIR, { recursive: true });
    
    // Check if memory_match.json exists
    try {
      await fs.access(MEMORY_MATCH_FILE);
    } catch (error) {
      // File doesn't exist, create it with initial structure
      const initialData: MemoryMatchData = {
        users: {},
        aggregateStats: {
          totalAssessments: 0,
          averageScores: {
            memory: { accuracy: 0, reactionTime: 0, span: 0, errorRate: 0 },
            attention: { focusScore: 0, consistency: 0, deliberationTime: 0 },
            processing: { cognitiveLoad: 0, processingSpeed: 0, efficiency: 0 },
            overall: { performanceScore: 0, confidenceLevel: 0, percentileRank: 0 }
          }
        }
      };
      await fs.writeFile(MEMORY_MATCH_FILE, JSON.stringify(initialData, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring cognitive data structure:', error);
    throw error;
  }
};

// Read memory match data
const readMemoryMatchData = async (): Promise<MemoryMatchData> => {
  try {
    await ensureCognitiveDirectory();
    
    try {
      const data = await fs.readFile(MEMORY_MATCH_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, return initial structure
      const initialData: MemoryMatchData = {
        users: {},
        aggregateStats: {
          totalAssessments: 0,
          averageScores: {
            memory: { accuracy: 0, reactionTime: 0, span: 0, errorRate: 0 },
            attention: { focusScore: 0, consistency: 0, deliberationTime: 0 },
            processing: { cognitiveLoad: 0, processingSpeed: 0, efficiency: 0 },
            overall: { performanceScore: 0, confidenceLevel: 0, percentileRank: 0 }
          }
        }
      };
      
      // Create file with initial structure
      await writeMemoryMatchData(initialData);
      return initialData;
    }
  } catch (error) {
    console.error('Error reading memory match data:', error);
    throw error;
  }
};

// Write memory match data
const writeMemoryMatchData = async (data: MemoryMatchData): Promise<void> => {
  try {
    await ensureCognitiveDirectory();
    // Use synchronous write to ensure immediate data persistence
    await fs.writeFile(
      MEMORY_MATCH_FILE,
      JSON.stringify(data, null, 2),
      { encoding: 'utf8', flag: 'w' }
    );
    // Verify the write was successful
    const written = await fs.readFile(MEMORY_MATCH_FILE, 'utf8');
    if (!written) {
      throw new Error('Failed to verify written data');
    }
  } catch (error) {
    console.error('Error writing memory match data:', error);
    throw error;
  }
};

// Type guard for metrics validation
const isMetricCategory = (category: string): category is keyof CognitiveMetrics => {
  return ['memory', 'attention', 'processing', 'overall'].includes(category);
};

// Type guards for each metric category
const isMemoryMetrics = (metrics: unknown): metrics is MetricValue => {
  const m = metrics as MetricValue;
  return typeof m?.accuracy === 'number' && 
         typeof m?.reactionTime === 'number' && 
         typeof m?.span === 'number' && 
         typeof m?.errorRate === 'number';
};

const isAttentionMetrics = (metrics: unknown): metrics is AttentionMetrics => {
  const m = metrics as AttentionMetrics;
  return typeof m?.focusScore === 'number' && 
         typeof m?.consistency === 'number' && 
         typeof m?.deliberationTime === 'number';
};

const isProcessingMetrics = (metrics: unknown): metrics is ProcessingMetrics => {
  const m = metrics as ProcessingMetrics;
  return typeof m?.cognitiveLoad === 'number' && 
         typeof m?.processingSpeed === 'number' && 
         typeof m?.efficiency === 'number';
};

const isOverallMetrics = (metrics: unknown): metrics is OverallMetrics => {
  const m = metrics as OverallMetrics;
  return typeof m?.performanceScore === 'number' && 
         typeof m?.confidenceLevel === 'number' && 
         typeof m?.percentileRank === 'number';
};

// Validate metrics data
const validateMetrics = (metrics: unknown): metrics is CognitiveMetrics => {
  if (!metrics || typeof metrics !== 'object') return false;

  const requiredMetrics = {
    memory: ['accuracy', 'reactionTime', 'span', 'errorRate'],
    attention: ['focusScore', 'consistency', 'deliberationTime'],
    processing: ['cognitiveLoad', 'processingSpeed', 'efficiency'],
    overall: ['performanceScore', 'confidenceLevel', 'percentileRank']
  } as const;

  try {
    // Check if all required categories exist
    const metricsObj = metrics as Record<string, unknown>;
    if (!Object.keys(requiredMetrics).every(category => category in metricsObj)) {
      return false;
    }

    // Check if all required metrics exist in each category
    return Object.entries(requiredMetrics).every(([category, metrics]) => {
      const categoryData = metricsObj[category] as Record<string, unknown>;
      return metrics.every(metric => 
        typeof categoryData[metric] === 'number' && !isNaN(categoryData[metric] as number)
      );
    });
  } catch (error) {
    return false;
  }
};

// Store Memory Match metrics
router.post('/metrics/memory-match', async (req, res) => {
  try {
    console.log('Received memory match metrics request');
    console.log('Request headers:', req.headers);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { userId, metrics } = req.body;

    // Validate required fields
    if (!userId || !metrics) {
      console.error('Missing required fields:', { userId: !!userId, metrics: !!metrics });
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          userId: !!userId,
          metrics: !!metrics
        }
      });
    }

    // Validate metrics structure
    if (!validateMetrics(metrics)) {
      console.error('Invalid metrics format:', metrics);
      return res.status(400).json({
        error: 'Invalid metrics format',
        details: {
          hasMemory: !!metrics.memory,
          hasAttention: !!metrics.attention,
          hasProcessing: !!metrics.processing,
          hasOverall: !!metrics.overall,
          metrics: metrics
        }
      });
    }

    // Ensure directory exists
    try {
      await fs.mkdir(COGNITIVE_DATA_DIR, { recursive: true });
      console.log('Cognitive data directory ensured:', COGNITIVE_DATA_DIR);
    } catch (error) {
      console.error('Error creating directory:', error);
      throw error;
    }

    // Initialize data structure if file doesn't exist
    let data: MemoryMatchData;
    try {
      try {
        const fileContent = await fs.readFile(MEMORY_MATCH_FILE, 'utf8');
        data = JSON.parse(fileContent);
        console.log('Existing data loaded');
      } catch (error) {
        console.log('No existing file, creating new data structure');
        data = {
          users: {},
          aggregateStats: {
            totalAssessments: 0,
            averageScores: {
              memory: { accuracy: 0, reactionTime: 0, span: 0, errorRate: 0 },
              attention: { focusScore: 0, consistency: 0, deliberationTime: 0 },
              processing: { cognitiveLoad: 0, processingSpeed: 0, efficiency: 0 },
              overall: { performanceScore: 0, confidenceLevel: 0, percentileRank: 0 }
            }
          }
        };
      }

      // Initialize user data if not exists
      if (!data.users[userId]) {
        console.log('Initializing new user:', userId);
        data.users[userId] = {
          assessments: [],
          cognitiveProfile: {
            memory: { baseline: null, trend: [] },
            attention: { baseline: null, trend: [] },
            processing: { baseline: null, trend: [] },
            overall: { baseline: null, trend: [] }
          }
        };
      }

      // Create assessment
      const assessment: Assessment = {
        timestamp: Date.now(),
        metrics,
        sessionId: `mm_${userId}_${Date.now()}`,
        environmentFactors: {
          timeOfDay: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          completionTime: metrics.memory.reactionTime * metrics.memory.span
        }
      };

      // Update user data
      data.users[userId].assessments.push(assessment);
      
      // Update baseline if first assessment
      if (!data.users[userId].cognitiveProfile.memory.baseline) {
        Object.keys(data.users[userId].cognitiveProfile).forEach(category => {
          if (isMetricCategory(category)) {
            data.users[userId].cognitiveProfile[category].baseline = metrics;
          }
        });
      }

      // Update trends
      Object.entries(metrics).forEach(([category, categoryMetrics]) => {
        if (isMetricCategory(category)) {
          data.users[userId].cognitiveProfile[category].trend.push({
            timestamp: Date.now(),
            metrics: categoryMetrics
          });
        }
      });

      // Update aggregate stats
      data.aggregateStats.totalAssessments++;

      // Write data
      console.log('Writing data to file:', MEMORY_MATCH_FILE);
      await fs.writeFile(MEMORY_MATCH_FILE, JSON.stringify(data, null, 2));

      // Verify write
      const verifyContent = await fs.readFile(MEMORY_MATCH_FILE, 'utf8');
      const verifyData = JSON.parse(verifyContent);
      
      if (!verifyData.users[userId]?.assessments.find((a: Assessment) => a.sessionId === assessment.sessionId)) {
        throw new Error('Data verification failed - assessment not found after write');
      }

      console.log('Data successfully written and verified');
      res.json({ 
        message: 'Memory match metrics stored successfully',
        assessmentId: assessment.sessionId
      });
    } catch (error) {
      console.error('Error handling data:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error storing memory match metrics:', error);
    res.status(500).json({
      error: 'Failed to store memory match metrics',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Get Memory Match cognitive profile
router.get('/metrics/memory-match/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await readMemoryMatchData();
    
    if (!data.users[userId]) {
      return res.status(404).json({ error: 'User cognitive profile not found' });
    }

    const userProfile = data.users[userId];
    const recentAssessments = userProfile.assessments.slice(-5); // Last 5 assessments

    // Calculate cognitive progress
    const progress = {
      memory: calculateProgress(userProfile.cognitiveProfile.memory),
      attention: calculateProgress(userProfile.cognitiveProfile.attention),
      processing: calculateProgress(userProfile.cognitiveProfile.processing),
      overall: calculateProgress(userProfile.cognitiveProfile.overall)
    };

    res.status(200).json({
      cognitiveProfile: userProfile.cognitiveProfile,
      recentAssessments,
      progress,
      percentileRanking: calculatePercentileRanking(userProfile, data.aggregateStats)
    });
  } catch (error) {
    console.error('Error retrieving cognitive profile:', error);
    res.status(500).json({ error: 'Failed to retrieve cognitive profile' });
  }
});

// Helper function to calculate cognitive progress
const calculateProgress = (categoryData: CognitiveProfile) => {
  const trend = categoryData.trend;
  if (trend.length < 2) return { improvement: 0, consistency: 100 };

  const recent = trend.slice(-5); // Last 5 assessments
  const values = recent.map(t => Object.values(t.metrics)).flat();
  
  const improvement = ((values[values.length - 1] - values[0]) / values[0]) * 100;
  const consistency = 100 - (calculateStandardDeviation(values) / calculateMean(values) * 100);

  return {
    improvement: Math.round(improvement * 10) / 10,
    consistency: Math.round(consistency * 10) / 10
  };
};

// Helper function to calculate percentile ranking with proper type checking
const calculatePercentileRanking = (userProfile: UserProfile, aggregateStats: AggregateStats) => {
  const latestAssessment = userProfile.assessments[userProfile.assessments.length - 1];
  const rankings: Record<string, Record<string, number>> = {};

  Object.entries(latestAssessment.metrics).forEach(([category, categoryMetrics]) => {
    if (isMetricCategory(category)) {
      rankings[category] = {};
      
      if (category === 'memory' && isMemoryMetrics(categoryMetrics)) {
        Object.entries(categoryMetrics).forEach(([metric, value]) => {
          const avgScore = aggregateStats.averageScores.memory[metric as keyof MetricValue];
          rankings[category][metric] = Math.round((value / avgScore) * 50 + 50);
        });
      } else if (category === 'attention' && isAttentionMetrics(categoryMetrics)) {
        Object.entries(categoryMetrics).forEach(([metric, value]) => {
          const avgScore = aggregateStats.averageScores.attention[metric as keyof AttentionMetrics];
          rankings[category][metric] = Math.round((value / avgScore) * 50 + 50);
        });
      } else if (category === 'processing' && isProcessingMetrics(categoryMetrics)) {
        Object.entries(categoryMetrics).forEach(([metric, value]) => {
          const avgScore = aggregateStats.averageScores.processing[metric as keyof ProcessingMetrics];
          rankings[category][metric] = Math.round((value / avgScore) * 50 + 50);
        });
      } else if (category === 'overall' && isOverallMetrics(categoryMetrics)) {
        Object.entries(categoryMetrics).forEach(([metric, value]) => {
          const avgScore = aggregateStats.averageScores.overall[metric as keyof OverallMetrics];
          rankings[category][metric] = Math.round((value / avgScore) * 50 + 50);
        });
      }
    }
  });

  return rankings;
};

// Test endpoint to write sample data
router.post('/metrics/memory-match/test-data', async (req, res) => {
  try {
    const testData: MemoryMatchData = {
      users: {
        "test_user_123": {
          assessments: [{
            timestamp: Date.now(),
            metrics: {
              memory: {
                accuracy: 85.5,
                reactionTime: 1.2,
                span: 8,
                errorRate: 14.5
              },
              attention: {
                focusScore: 92.0,
                consistency: 88.5,
                deliberationTime: 0.8
              },
              processing: {
                cognitiveLoad: 65.5,
                processingSpeed: 4.2,
                efficiency: 78.9
              },
              overall: {
                performanceScore: 82.5,
                confidenceLevel: 90.0,
                percentileRank: 75
              }
            },
            sessionId: `test_session_${Date.now()}`,
            environmentFactors: {
              timeOfDay: new Date().getHours(),
              dayOfWeek: new Date().getDay(),
              completionTime: 45.2
            }
          }],
          cognitiveProfile: {
            memory: {
              baseline: null,
              trend: [{
                timestamp: Date.now(),
                metrics: { accuracy: 85.5, reactionTime: 1.2, span: 8, errorRate: 14.5 }
              }]
            },
            attention: {
              baseline: null,
              trend: [{
                timestamp: Date.now(),
                metrics: { focusScore: 92.0, consistency: 88.5, deliberationTime: 0.8 }
              }]
            },
            processing: {
              baseline: null,
              trend: [{
                timestamp: Date.now(),
                metrics: { cognitiveLoad: 65.5, processingSpeed: 4.2, efficiency: 78.9 }
              }]
            },
            overall: {
              baseline: null,
              trend: [{
                timestamp: Date.now(),
                metrics: { performanceScore: 82.5, confidenceLevel: 90.0, percentileRank: 75 }
              }]
            }
          }
        }
      },
      aggregateStats: {
        totalAssessments: 1,
        averageScores: {
          memory: { accuracy: 85.5, reactionTime: 1.2, span: 8, errorRate: 14.5 },
          attention: { focusScore: 92.0, consistency: 88.5, deliberationTime: 0.8 },
          processing: { cognitiveLoad: 65.5, processingSpeed: 4.2, efficiency: 78.9 },
          overall: { performanceScore: 82.5, confidenceLevel: 90.0, percentileRank: 75 }
        }
      }
    };

    await writeMemoryMatchData(testData);
    
    // Verify the write was successful
    const verifyData = await readMemoryMatchData();
    if (!verifyData.users["test_user_123"]) {
      throw new Error('Failed to verify written test data');
    }

    res.status(200).json({ 
      message: 'Test data written successfully',
      data: testData
    });
  } catch (error) {
    console.error('Error writing test data:', error);
    res.status(500).json({ error: 'Failed to write test data' });
  }
});

// Simple test endpoint
router.post('/test', async (req, res) => {
  try {
    console.log('Test endpoint hit:', req.body);
    res.status(200).json({ message: 'Test successful', received: req.body });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: 'Test failed' });
  }
});

export default router; 