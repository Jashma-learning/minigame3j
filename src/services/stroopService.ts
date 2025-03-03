import { 
  StroopMetrics, 
  StroopMetricsResponse, 
  StroopProfileResponse 
} from '../types/cognitive/stroop.types';
import { AggregateStats } from '../types/cognitive/shared.types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Stores metrics for a Stroop Challenge session
 * @param userId - The user ID
 * @param metrics - The metrics to store
 * @returns A promise resolving to the metrics response
 */
export const storeMetrics = async (
  userId: string, 
  metrics: StroopMetrics
): Promise<StroopMetricsResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/metrics/stroop/${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ metrics })
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to store Stroop metrics:', error);
    throw error;
  }
};

/**
 * Gets the cognitive profile for a user
 * @param userId - The user ID
 * @returns A promise resolving to the cognitive profile
 */
export const getCognitiveProfile = async (
  userId: string
): Promise<StroopProfileResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/cognitive-profile/stroop/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get Stroop cognitive profile:', error);
    throw error;
  }
};

/**
 * Gets aggregate statistics for the Stroop Challenge
 * @returns A promise resolving to the aggregate statistics
 */
export const getAggregateStats = async (): Promise<AggregateStats> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/aggregate-stats/stroop`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get Stroop aggregate statistics:', error);
    throw error;
  }
};

const stroopService = {
  storeMetrics,
  getCognitiveProfile,
  getAggregateStats
};

export default stroopService; 