import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { 
  StroopMetrics, 
  StroopMetricsResponse, 
  StroopUserData,
  StroopData,
  StroopAssessment,
  StroopProgress,
  StroopPercentileRanking
} from '../types/cognitive/stroop.types';
import {
  calculateProgressStroop,
  calculatePercentileRankingStroop,
  calculateStroopProfile
} from '../utils/stroopMetricCalculations';
import { CognitiveProfile } from '../types/cognitive/shared.types';
import { COGNITIVE_DATA_DIR, ensureCognitiveDirectory } from '../utils/fileSystem';

// Path to the data file - update to use the cognitive directory
const dataFilePath = path.join(COGNITIVE_DATA_DIR, 'stroop.json');

// Helper function to ensure the data file exists
const ensureDataFileExists = async (): Promise<void> => {
  // Use the existing utility to ensure the cognitive directory exists
  await ensureCognitiveDirectory();
  
  if (!fs.existsSync(dataFilePath)) {
    const initialData: StroopData = {
      users: {},
      aggregateStats: {
        totalAssessments: 0,
        averageScores: {
          inhibition: { accuracy: 0, interference: 0 },
          attention: { sustainedAttention: 0, vigilanceLevel: 0 },
          processing: { averageReactionTime: 0, processingEfficiency: 0 },
          flexibility: { adaptiveControl: 0, errorRecovery: 0 },
          overall: { performanceScore: 0, compositeScore: 0 }
        }
      }
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
  }
};

// Helper function to read the data file
const readDataFile = async (): Promise<StroopData> => {
  await ensureDataFileExists();
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data) as StroopData;
};

// Helper function to write to the data file
const writeDataFile = async (data: StroopData): Promise<void> => {
  await ensureDataFileExists();
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Helper function to update aggregate statistics
const updateAggregateStats = (data: StroopData): void => {
  const allMetrics: StroopMetrics[] = [];
  
  // Collect all metrics from all users
  Object.values(data.users).forEach(user => {
    user.assessments.forEach(assessment => {
      allMetrics.push(assessment.metrics);
    });
  });
  
  if (allMetrics.length === 0) {
    return;
  }
  
  // Calculate average scores for each metric
  const averageScores = {
    inhibition: {
      accuracy: allMetrics.reduce((sum, m) => sum + m.inhibition.accuracy, 0) / allMetrics.length,
      interference: allMetrics.reduce((sum, m) => sum + m.inhibition.interference, 0) / allMetrics.length
    },
    attention: {
      sustainedAttention: allMetrics.reduce((sum, m) => sum + m.attention.sustainedAttention, 0) / allMetrics.length,
      vigilanceLevel: allMetrics.reduce((sum, m) => sum + m.attention.vigilanceLevel, 0) / allMetrics.length
    },
    processing: {
      averageReactionTime: allMetrics.reduce((sum, m) => sum + m.processing.averageReactionTime, 0) / allMetrics.length,
      processingEfficiency: allMetrics.reduce((sum, m) => sum + m.processing.processingEfficiency, 0) / allMetrics.length
    },
    flexibility: {
      adaptiveControl: allMetrics.reduce((sum, m) => sum + m.flexibility.adaptiveControl, 0) / allMetrics.length,
      errorRecovery: allMetrics.reduce((sum, m) => sum + m.flexibility.errorRecovery, 0) / allMetrics.length
    },
    overall: {
      performanceScore: allMetrics.reduce((sum, m) => sum + m.overall.performanceScore, 0) / allMetrics.length,
      compositeScore: allMetrics.reduce((sum, m) => sum + m.overall.compositeScore, 0) / allMetrics.length
    }
  };
  
  // Update aggregate stats
  data.aggregateStats = {
    totalAssessments: allMetrics.length,
    averageScores
  };
};

/**
 * Controller to store Stroop metrics for a user
 */
export const storeStroopMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const metrics: StroopMetrics = req.body.metrics;
    
    // Validate input
    if (!userId || !metrics) {
      res.status(400).json({ error: 'Invalid input data' });
      return;
    }
    
    // Read current data
    const data = await readDataFile();
    
    // Create session ID
    const sessionId = uuidv4();
    const timestamp = Date.now();
    
    // Get current time information for environment factors
    const now = new Date();
    const timeOfDay = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Create the assessment object
    const assessment: StroopAssessment = {
      sessionId,
      timestamp,
      metrics,
      environmentFactors: {
        timeOfDay,
        dayOfWeek,
        completionTime: 0 // This would be provided by the client in a real scenario
      }
    };
    
    // Initialize user data if it doesn't exist
    if (!data.users[userId]) {
      const initialProgress: StroopProgress = {
        inhibition: { improvement: 0, consistency: 100 },
        attention: { improvement: 0, consistency: 100 },
        processing: { improvement: 0, consistency: 100 },
        flexibility: { improvement: 0, consistency: 100 },
        overall: { improvement: 0, consistency: 100 }
      };
      
      data.users[userId] = {
        assessments: [],
        progress: initialProgress,
        percentileRanking: {},
        cognitiveProfile: {
          inhibition: { baseline: null, trend: [] },
          attention: { baseline: null, trend: [] },
          processing: { baseline: null, trend: [] },
          flexibility: { baseline: null, trend: [] },
          overall: { baseline: null, trend: [] }
        }
      };
    }
    
    // Add new assessment
    data.users[userId].assessments.push(assessment);
    
    // Update user progress
    data.users[userId].progress = calculateProgressStroop(
      data.users[userId].assessments.map(a => ({ timestamp: a.timestamp, metrics: a.metrics }))
    );
    
    // Build array of all metrics from all users for percentile calculation
    const allMetrics: StroopMetrics[] = [];
    Object.values(data.users).forEach(user => {
      if (user.assessments.length > 0) {
        // Get the most recent assessment
        const latestAssessment = user.assessments.sort((a, b) => b.timestamp - a.timestamp)[0];
        allMetrics.push(latestAssessment.metrics);
      }
    });
    
    // Update user percentile rankings
    data.users[userId].percentileRanking = calculatePercentileRankingStroop(
      metrics,
      allMetrics
    );
    
    // Update cognitive profile
    data.users[userId].cognitiveProfile = calculateStroopProfile(
      data.users[userId].assessments
    );
    
    // Update aggregate statistics
    updateAggregateStats(data);
    
    // Save updated data
    await writeDataFile(data);
    
    // Build response
    const response: StroopMetricsResponse = {
      userId,
      sessionId,
      timestamp,
      metrics,
      progress: data.users[userId].progress,
      percentileRanking: data.users[userId].percentileRanking
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error storing Stroop metrics:', error);
    res.status(500).json({ error: 'Failed to store metrics' });
  }
};

/**
 * Controller to get a user's cognitive profile for the Stroop challenge
 */
export const getStroopCognitiveProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }
    
    // Read data file
    const data = await readDataFile();
    
    // Check if user exists
    if (!data.users[userId]) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.status(200).json({
      userId,
      profile: data.users[userId].cognitiveProfile,
      progress: data.users[userId].progress,
      percentileRanking: data.users[userId].percentileRanking
    });
  } catch (error) {
    console.error('Error getting Stroop cognitive profile:', error);
    res.status(500).json({ error: 'Failed to retrieve cognitive profile' });
  }
};

/**
 * Controller to get aggregate statistics for the Stroop challenge
 */
export const getStroopAggregateStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Read data file
    const data = await readDataFile();
    
    res.status(200).json(data.aggregateStats);
  } catch (error) {
    console.error('Error getting Stroop aggregate stats:', error);
    res.status(500).json({ error: 'Failed to retrieve aggregate statistics' });
  }
}; 