import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { GoNoGoMetrics } from '../types/cognitive/goNoGo.types';
import { CognitiveProfile } from '../types/cognitive/shared.types';
import { COGNITIVE_DATA_DIR, ensureCognitiveDirectory } from '../utils/fileSystem';
import { calculateMeanGoNoGo, calculateProgressGoNoGo, calculatePercentileRankingGoNoGo } from '../utils/goNoGoMetricCalculations';
import { MetricValue, AttentionMetrics, ProcessingMetrics, OverallMetrics } from '../types/cognitive/metrics.types';

// Type definitions for metrics
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

// Go/No-Go Data Structure
interface GoNoGoData {
  users: Record<string, {
    assessments: Array<{
      timestamp: number;
      metrics: GoNoGoMetrics;
      sessionId: string;
      environmentFactors: {
        timeOfDay: number;
        dayOfWeek: number;
        completionTime: number;
      };
    }>;
    cognitiveProfile: {
      inhibition: CognitiveProfile;
      attention: CognitiveProfile;
      processing: CognitiveProfile;
      learning: CognitiveProfile;
      overall: CognitiveProfile;
    };
  }>;
  aggregateStats: {
    totalAssessments: number;
    averageScores: {
      inhibition: Record<string, number>;
      attention: Record<string, number>;
      processing: Record<string, number>;
      learning: Record<string, number>;
      overall: Record<string, number>;
    };
  };
}

const router = express.Router();
const MEMORY_MATCH_FILE = path.join(COGNITIVE_DATA_DIR, 'memory_match.json');
const GO_NO_GO_FILE = path.join(COGNITIVE_DATA_DIR, 'go_no_go.json');

// Read memory match data
const readMemoryMatchData = async (): Promise<MemoryMatchData> => {
  try {
    await ensureCognitiveDirectory();
    
    try {
      const data = await fs.promises.readFile(MEMORY_MATCH_FILE, 'utf8');
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
    await fs.promises.writeFile(
      MEMORY_MATCH_FILE,
      JSON.stringify(data, null, 2),
      { encoding: 'utf8', flag: 'w' }
    );
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

// Validate metrics structure
const validateMetrics = (metrics: unknown): metrics is CognitiveMetrics => {
  if (typeof metrics !== 'object' || metrics === null) return false;
  
  const m = metrics as CognitiveMetrics;
  return isMemoryMetrics(m.memory) &&
         isAttentionMetrics(m.attention) &&
         isProcessingMetrics(m.processing) &&
         isOverallMetrics(m.overall);
};

// Route handler for storing memory match metrics
router.post('/metrics/memory-match', async (req: Request, res: Response) => {
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

    const data = await readMemoryMatchData();

    // Initialize user data if not exists
    if (!data.users[userId]) {
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

    // Add assessment to user's data
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

    // Write data
    await writeMemoryMatchData(data);

    res.json({ 
      message: 'Memory match metrics stored successfully',
      assessmentId: assessment.sessionId
    });
  } catch (error) {
    console.error('Error storing memory match metrics:', error);
    res.status(500).json({
      error: 'Failed to store memory match metrics'
    });
  }
});

// Read Go/No-Go data from JSON file
const readGoNoGoData = async (): Promise<GoNoGoData> => {
  try {
    await ensureCognitiveDirectory();
    
    if (!fs.existsSync(GO_NO_GO_FILE)) {
      console.log('Creating initial Go/No-Go data file');
      // Initialize with empty data structure if file doesn't exist
      const initialData: GoNoGoData = {
        users: {},
        aggregateStats: {
          totalAssessments: 0,
          averageScores: {
            inhibition: {},
            attention: {},
            processing: {},
            learning: {},
            overall: {}
          }
        }
      };
      await fs.promises.writeFile(GO_NO_GO_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }

    console.log('Reading existing Go/No-Go data file');
    const fileContent = await fs.promises.readFile(GO_NO_GO_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading Go/No-Go data:', error);
    throw error;
  }
};

// Write Go/No-Go data to JSON file
const writeGoNoGoData = async (data: GoNoGoData): Promise<void> => {
  try {
    await ensureCognitiveDirectory();
    console.log('Ensuring cognitive directory exists for write');
    console.log('Ensuring cognitive directory exists at:', COGNITIVE_DATA_DIR);
    if (!fs.existsSync(COGNITIVE_DATA_DIR)) {
      console.log('Creating cognitive directory');
      fs.mkdirSync(COGNITIVE_DATA_DIR, { recursive: true });
    } else {
      console.log('Cognitive directory already exists');
    }
    console.log('Writing data to file');
    await fs.promises.writeFile(GO_NO_GO_FILE, JSON.stringify(data, null, 2));
    console.log('Successfully wrote Go/No-Go data to file');
  } catch (error) {
    console.error('Error writing Go/No-Go data:', error);
    throw error;
  }
};

// Update Go/No-Go aggregate stats
const updateGoNoGoAggregateStats = (data: GoNoGoData): void => {
  const allAssessments = Object.values(data.users).flatMap(user => user.assessments);
  data.aggregateStats.totalAssessments = allAssessments.length;

  if (allAssessments.length === 0) return;

  // Calculate average scores for each metric category
  const categories = ['inhibition', 'attention', 'processing', 'learning', 'overall'] as const;
  
  categories.forEach(category => {
    const metrics = Object.keys(allAssessments[0].metrics[category]);
    metrics.forEach(metric => {
      const values = allAssessments.map(a => a.metrics[category][metric as keyof typeof a.metrics[typeof category]]);
      data.aggregateStats.averageScores[category][metric] = calculateMeanGoNoGo(values);
    });
  });
};

// Calculate Go/No-Go cognitive profile
const calculateGoNoGoProfile = (assessments: GoNoGoData['users'][string]['assessments']): GoNoGoData['users'][string]['cognitiveProfile'] => {
  if (assessments.length === 0) {
    return {
      inhibition: { baseline: null, trend: [] },
      attention: { baseline: null, trend: [] },
      processing: { baseline: null, trend: [] },
      learning: { baseline: null, trend: [] },
      overall: { baseline: null, trend: [] }
    };
  }

  const categories = ['inhibition', 'attention', 'processing', 'learning', 'overall'] as const;
  const profile: GoNoGoData['users'][string]['cognitiveProfile'] = {
    inhibition: { baseline: null, trend: [] },
    attention: { baseline: null, trend: [] },
    processing: { baseline: null, trend: [] },
    learning: { baseline: null, trend: [] },
    overall: { baseline: null, trend: [] }
  };

  categories.forEach(category => {
    profile[category] = {
      baseline: assessments[0].metrics[category],
      trend: assessments.map(assessment => ({
        timestamp: assessment.timestamp,
        metrics: assessment.metrics[category]
      }))
    };
  });

  return profile;
};

// Route handler for storing Go/No-Go metrics
router.post('/metrics/go-no-go', async (req: Request, res: Response) => {
  try {
    console.log('Received Go/No-Go metrics request:', {
      body: req.body,
      headers: req.headers['content-type']
    });

    const { userId, metrics } = req.body;

    if (!userId || !metrics) {
      console.error('Missing required fields:', { userId: !!userId, metrics: !!metrics });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId and metrics'
      });
    }

    console.log('Validating metrics structure:', JSON.stringify(metrics, null, 2));
    
    // Validate metrics structure
    const requiredCategories = ['inhibition', 'attention', 'processing', 'learning', 'overall'];
    const missingCategories = requiredCategories.filter(category => !metrics[category]);
    
    if (missingCategories.length > 0) {
      console.error('Missing metric categories:', missingCategories);
      return res.status(400).json({
        success: false,
        error: `Missing metric categories: ${missingCategories.join(', ')}`
      });
    }

    const data = await readGoNoGoData();
    console.log('Current data state:', Object.keys(data));

    // Initialize user data if not exists
    if (!data.users[userId]) {
      console.log('Initializing new user data:', userId);
      data.users[userId] = {
        assessments: [],
        cognitiveProfile: {
          inhibition: { baseline: null, trend: [] },
          attention: { baseline: null, trend: [] },
          processing: { baseline: null, trend: [] },
          learning: { baseline: null, trend: [] },
          overall: { baseline: null, trend: [] }
        }
      };
    }

    // Create new assessment
    const assessment = {
      timestamp: Date.now(),
      metrics,
      sessionId: `gng_${userId}_${Date.now()}`,
      environmentFactors: {
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        completionTime: 0 // This should be provided in the request if available
      }
    };

    // Add assessment to user's data
    data.users[userId].assessments.push(assessment);
    console.log('Added new assessment with ID:', assessment.sessionId);

    // Update cognitive profile
    data.users[userId].cognitiveProfile = calculateGoNoGoProfile(data.users[userId].assessments);
    console.log('Updated cognitive profile');

    // Update aggregate stats
    updateGoNoGoAggregateStats(data);
    console.log('Updated aggregate stats');

    // Save updated data
    console.log('Writing data to file');
    await writeGoNoGoData(data);
    console.log('Saved data to file');

    res.json({
      success: true,
      message: 'Go/No-Go metrics stored successfully',
      assessmentId: assessment.sessionId
    });
  } catch (error) {
    console.error('Error storing Go/No-Go metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Route handler for retrieving Go/No-Go cognitive profile
router.get('/metrics/go-no-go/profile/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const data = await readGoNoGoData();

    if (!data.users[userId]) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    const userProfile = data.users[userId];
    const recentAssessments = userProfile.assessments.slice(-5); // Get last 5 assessments

    // Calculate progress for each category
    const progress = {
      inhibition: calculateProgressGoNoGo(userProfile.cognitiveProfile.inhibition),
      attention: calculateProgressGoNoGo(userProfile.cognitiveProfile.attention),
      processing: calculateProgressGoNoGo(userProfile.cognitiveProfile.processing),
      learning: calculateProgressGoNoGo(userProfile.cognitiveProfile.learning),
      overall: calculateProgressGoNoGo(userProfile.cognitiveProfile.overall)
    };

    // Calculate percentile rankings
    const percentileRanking = calculatePercentileRankingGoNoGo(userProfile, data.aggregateStats);

    res.json({
      success: true,
      data: {
        cognitiveProfile: userProfile.cognitiveProfile,
        recentAssessments,
        progress,
        percentileRanking
      }
    });
  } catch (error) {
    console.error('Error retrieving Go/No-Go profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve Go/No-Go profile'
    });
  }
});

// Simple test endpoint
router.post('/test', async (req: Request, res: Response) => {
  try {
    console.log('Test endpoint hit:', req.body);
    res.status(200).json({ message: 'Test successful', received: req.body });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: 'Test failed' });
  }
});

export default router; 