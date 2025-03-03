import fs from 'fs';
import path from 'path';
import { CognitiveProfile } from './types/cognitive/shared.types';
import { GoNoGoMetrics } from './types/cognitive/goNoGo.types';
import { COGNITIVE_DATA_DIR, ensureCognitiveDirectory } from './utils/fileSystem';
import { calculateMeanGoNoGo } from './utils/goNoGoMetricCalculations';

const GO_NO_GO_FILE = path.join(COGNITIVE_DATA_DIR, 'go_no_go.json');

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
    console.log('Writing data to file:', JSON.stringify(data, null, 2));
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

// Test function to simulate storing metrics
async function testStoreMetrics() {
  try {
    console.log('Starting test for storing Go/No-Go metrics');
    
    // Read the current data
    const data = await readGoNoGoData();
    console.log('Current data structure:', Object.keys(data));
    
    const userId = 'test_user_123';
    const metrics = {
      inhibition: {
        accuracy: 85.5,
        noGoAccuracy: 90,
        goAccuracy: 82.5,
        falseAlarms: 2,
        missedGoes: 3
      },
      attention: {
        sustainedAttention: 88.5,
        vigilanceLevel: 85,
        attentionalLapses: 4,
        focusQuality: 82.5
      },
      processing: {
        averageReactionTime: 450.5,
        reactionTimeVariability: 50.2,
        processingEfficiency: 78.5,
        adaptiveControl: 85
      },
      learning: {
        learningRate: 75.5,
        errorCorrectionSpeed: 82,
        adaptationQuality: 79.5,
        performanceStability: 88
      },
      overall: {
        performanceScore: 84.5,
        cognitiveFatigue: 25.5,
        consistencyIndex: 88.5,
        compositeScore: 82
      }
    };
    
    // Initialize user data if it doesn't exist
    if (!data.users[userId]) {
      console.log(`Initializing user data for ${userId}`);
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
    
    // Create a new assessment
    const timestamp = Date.now();
    const sessionId = `gng_${userId}_${timestamp}`;
    const assessment = {
      timestamp,
      metrics,
      sessionId,
      environmentFactors: {
        timeOfDay: 9,
        dayOfWeek: 1,
        completionTime: 0
      }
    };
    
    // Add the assessment to the user's data
    data.users[userId].assessments.push(assessment);
    console.log('Added new assessment');
    
    // Update the cognitive profile
    data.users[userId].cognitiveProfile = calculateGoNoGoProfile(data.users[userId].assessments);
    console.log('Updated cognitive profile');
    
    // Update aggregate stats
    updateGoNoGoAggregateStats(data);
    console.log('Updated aggregate stats');
    
    // Write the updated data back to the file
    await writeGoNoGoData(data);
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testStoreMetrics().then(() => {
  console.log('Test execution completed');
}); 