import axios from 'axios';
import { 
  Maze2DMetrics, 
  Maze2DMetricsResponse, 
  Maze2DProfileResponse 
} from '../types/cognitive/maze2d.types';
import { AggregateStats } from '../types/cognitive/shared.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Stores metrics for a user's Maze2D gameplay session
 * @param userId - The user's ID
 * @param metrics - The Maze2D metrics to store
 */
export const storeMetrics = async (userId: string, metrics: Maze2DMetrics): Promise<Maze2DMetricsResponse> => {
  try {
    const response = await axios.post(`${API_URL}/maze/metrics`, {
      userId,
      metrics
    });
    return response.data;
  } catch (error) {
    console.error('Error storing Maze2D metrics:', error);
    throw error;
  }
};

/**
 * Gets a user's cognitive profile for Maze2D
 * @param userId - The user's ID
 */
export const getCognitiveProfile = async (userId: string): Promise<Maze2DProfileResponse> => {
  try {
    const response = await axios.get(`${API_URL}/maze/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting Maze2D cognitive profile:', error);
    throw error;
  }
};

/**
 * Gets aggregate statistics for Maze2D
 */
export const getAggregateStats = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/maze/stats`);
    return response.data;
  } catch (error) {
    console.error('Error getting Maze2D aggregate stats:', error);
    throw error;
  }
}; 