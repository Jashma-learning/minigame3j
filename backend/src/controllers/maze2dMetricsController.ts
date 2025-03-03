import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { calculatePercentileRanking } from '../utils/statisticsUtils';
import { v4 as uuidv4 } from 'uuid';

// Define types locally to avoid import issues
interface PathPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface Maze2DGameState {
  path: PathPoint[];
  timeElapsed: number;
  wallCollisions: number;
  revisitedCells: number;
  totalCells: number;
  cellsVisited: number;
  hintsUsed: number;
  difficulty: number;
  completed: boolean;
  optimalPathLength: number;
  actualPathLength: number;
  moveTimes: number[];
  decisionPointTimes: number[];
}

// Add index signatures to avoid type errors with string indexing
interface Maze2DMetrics {
  spatialNavigation: { [key: string]: number };
  decisionMaking: { [key: string]: number };
  problemSolving: { [key: string]: number };
  attention: { [key: string]: number };
  overall: { [key: string]: number };
  [key: string]: { [key: string]: number };
}

interface Maze2DScores {
  spatialNavigation: number;
  decisionMaking: number;
  problemSolving: number;
  attention: number;
  overall: number;
  [key: string]: number;
}

interface Maze2DProgress {
  timestamp: string;
  score: number;
}

interface Maze2DAssessment {
  id: string;
  timestamp: string;
  metrics: Maze2DMetrics;
  averageScores: Maze2DScores;
}

interface Maze2DUserData {
  assessments: Maze2DAssessment[];
  progress: {
    spatialNavigation: Maze2DProgress[];
    decisionMaking: Maze2DProgress[];
    problemSolving: Maze2DProgress[];
    attention: Maze2DProgress[];
    overall: Maze2DProgress[];
    [key: string]: Maze2DProgress[];
  };
}

// Updated interface to fix timestamp type issue
interface DistributionDataPoint {
  timestamp: string;
  spatialNavigation: number;
  decisionMaking: number;
  problemSolving: number;
  attention: number;
  overall: number;
  [key: string]: string | number;  // Allow both string and number values
}

interface Maze2DData {
  users: {
    [userId: string]: Maze2DUserData;
  };
  aggregateStats: {
    totalAssessments: number;
    averageScores: Maze2DScores;
    distributionData: DistributionDataPoint[];
  };
}

interface Maze2DMetricsResponse {
  assessmentId: string;
  timestamp: string;
  averageScores: Maze2DScores;
}

interface Maze2DPercentileRanking {
  spatialNavigation: number;
  decisionMaking: number;
  problemSolving: number;
  attention: number;
  overall: number;
  [key: string]: number;
}

interface Maze2DProfileResponse {
  userId: string;
  latestAssessment: Maze2DAssessment;
  progress: {
    spatialNavigation: Maze2DProgress[];
    decisionMaking: Maze2DProgress[];
    problemSolving: Maze2DProgress[];
    attention: Maze2DProgress[];
    overall: Maze2DProgress[];
    [key: string]: Maze2DProgress[];
  };
  percentileRanking: Maze2DPercentileRanking;
  recommendedFocus: string;
}

// Path to the data file
const DATA_DIR = path.join(__dirname, '../../data/cognitive');
const DATA_FILE = path.join(DATA_DIR, 'maze2dMetrics.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(__dirname, '../../data/cognitive');
  try {
    await fs.mkdir(dataDir, { recursive: true });
    console.log('Maze2D cognitive data directory created or already exists');
  } catch (error) {
    console.error('Error creating Maze2D cognitive data directory:', error);
  }
}

// Read data from file
async function readData(): Promise<Maze2DData> {
  await ensureDataDir();
  const filePath = path.join(__dirname, '../../data/cognitive/maze2d.json');
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('No Maze2D metrics file found, creating a new one');
      const initialData: Maze2DData = {
        users: {},
        aggregateStats: {
          totalAssessments: 0,
          averageScores: {
            spatialNavigation: 0,
            decisionMaking: 0,
            problemSolving: 0,
            attention: 0,
            overall: 0
          },
          distributionData: []
        }
      };
      
      await writeData(initialData);
      return initialData;
    } else {
      console.error('Error reading Maze2D metrics file:', error);
      throw new Error('Failed to read Maze2D metrics data');
    }
  }
}

// Write data to file
async function writeData(data: Maze2DData): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(__dirname, '../../data/cognitive/maze2d.json');
  
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Maze2D metrics data written successfully');
  } catch (error) {
    console.error('Error writing Maze2D metrics data:', error);
    throw new Error('Failed to write Maze2D metrics data');
  }
}

/**
 * Calculate the average scores for all categories
 */
function calculateAverageScores(metrics: Maze2DMetrics): Maze2DScores {
  return {
    spatialNavigation: calculateCategoryAverage(metrics.spatialNavigation),
    decisionMaking: calculateCategoryAverage(metrics.decisionMaking),
    problemSolving: calculateCategoryAverage(metrics.problemSolving),
    attention: calculateCategoryAverage(metrics.attention),
    overall: calculateCategoryAverage(metrics.overall)
  };
}

/**
 * Calculate the average score for a category of metrics
 */
function calculateCategoryAverage(categoryMetrics: { [key: string]: number }): number {
  const values = Object.values(categoryMetrics);
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Update aggregate statistics with new assessment data
 */
function updateAggregateStats(data: Maze2DData, averageScores: Maze2DScores) {
  const { aggregateStats } = data;
  
  // Increment total assessments
  aggregateStats.totalAssessments += 1;
  
  // Update average scores
  const categories = ['spatialNavigation', 'decisionMaking', 'problemSolving', 'attention', 'overall'];
  
  categories.forEach(category => {
    const currentAvg = aggregateStats.averageScores[category];
    const currentTotal = aggregateStats.totalAssessments - 1;
    
    // Calculate new average
    const newAvg = currentAvg === 0 
      ? averageScores[category]
      : (currentAvg * currentTotal + averageScores[category]) / aggregateStats.totalAssessments;
    
    aggregateStats.averageScores[category] = newAvg;
  });
  
  // Update distribution data (simplified for now)
  // Create proper DistributionDataPoint object with correct types
  const distributionDataPoint: DistributionDataPoint = {
    timestamp: new Date().toISOString(),
    spatialNavigation: averageScores.spatialNavigation,
    decisionMaking: averageScores.decisionMaking,
    problemSolving: averageScores.problemSolving,
    attention: averageScores.attention,
    overall: averageScores.overall
  };
  
  aggregateStats.distributionData.push(distributionDataPoint);
  
  return aggregateStats;
}

/**
 * Store metrics for a Maze2D game session
 */
export const storeMetrics = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { metrics } = req.body as { metrics: Maze2DMetrics };
    
    // Validate input
    if (!userId || !metrics) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Read existing data
    const data = await readData();
    
    // Generate assessment ID
    const assessmentId = uuidv4();
    
    // Calculate average scores
    const averageScores = calculateAverageScores(metrics);
    
    // Create assessment object
    const assessment = {
      id: assessmentId,
      timestamp: new Date().toISOString(),
      metrics,
      averageScores
    };
    
    // Initialize user data if it doesn't exist
    if (!data.users[userId]) {
      data.users[userId] = {
        assessments: [],
        progress: {
          spatialNavigation: [],
          decisionMaking: [],
          problemSolving: [],
          attention: [],
          overall: []
        }
      };
    }
    
    // Add assessment to user data
    data.users[userId].assessments.push(assessment);
    
    // Update user progress
    const categories = ['spatialNavigation', 'decisionMaking', 'problemSolving', 'attention', 'overall'];
    
    categories.forEach(category => {
      data.users[userId].progress[category].push({
        timestamp: assessment.timestamp,
        score: averageScores[category]
      });
    });
    
    // Update aggregate statistics
    updateAggregateStats(data, averageScores);
    
    // Write updated data to file
    await writeData(data);
    
    // Prepare response
    const response: Maze2DMetricsResponse = {
      assessmentId,
      timestamp: assessment.timestamp,
      averageScores
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error storing Maze2D metrics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get cognitive profile for a user
 */
export const getCognitiveProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }
    
    // Read data
    const data = await readData();
    
    // Check if user exists
    if (!data.users[userId]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = data.users[userId];
    
    // Get latest assessment
    const latestAssessment = userData.assessments[userData.assessments.length - 1];
    
    // Calculate percentile rankings
    const percentileRanking: Maze2DPercentileRanking = {
      spatialNavigation: calculatePercentileRanking(latestAssessment.averageScores.spatialNavigation),
      decisionMaking: calculatePercentileRanking(latestAssessment.averageScores.decisionMaking),
      problemSolving: calculatePercentileRanking(latestAssessment.averageScores.problemSolving),
      attention: calculatePercentileRanking(latestAssessment.averageScores.attention),
      overall: calculatePercentileRanking(latestAssessment.averageScores.overall)
    };
    
    // Prepare response
    const response: Maze2DProfileResponse = {
      userId,
      latestAssessment: {
        id: latestAssessment.id,
        timestamp: latestAssessment.timestamp,
        metrics: latestAssessment.metrics,
        averageScores: latestAssessment.averageScores
      },
      progress: userData.progress,
      percentileRanking,
      recommendedFocus: determineRecommendedFocus(latestAssessment.averageScores)
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving Maze2D cognitive profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get aggregate statistics for Maze2D
 */
export const getAggregateStats = async (req: Request, res: Response) => {
  try {
    // Read data
    const data = await readData();
    
    return res.status(200).json(data.aggregateStats);
  } catch (error) {
    console.error('Error retrieving Maze2D aggregate statistics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Determine the recommended focus area based on scores
 */
function determineRecommendedFocus(averageScores: Maze2DScores): string {
  // Find the category with the lowest score (excluding 'overall')
  const categories = ['spatialNavigation', 'decisionMaking', 'problemSolving', 'attention'];
  let lowestCategory = categories[0];
  let lowestScore = averageScores[lowestCategory];
  
  categories.forEach(category => {
    if (averageScores[category] < lowestScore) {
      lowestScore = averageScores[category];
      lowestCategory = category;
    }
  });
  
  // Map category to readable recommendation
  const recommendations: Record<string, string> = {
    spatialNavigation: 'Improve spatial awareness and navigation skills',
    decisionMaking: 'Practice deliberate decision-making at key junctions',
    problemSolving: 'Enhance problem-solving strategies and efficiency',
    attention: 'Focus on maintaining consistent attention throughout tasks'
  };
  
  return recommendations[lowestCategory];
} 