import { MemoryMatchMetrics, MemoryMatchMetricsResponse, MemoryMatchProfileResponse } from '../types/cognitive/memoryMatch.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const memoryMatchService = {
  // Store metrics for a completed game
  storeMetrics: async (userId: string, metrics: MemoryMatchMetrics): Promise<MemoryMatchMetricsResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/metrics/memory-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ userId, metrics })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to store metrics');
      }

      return response.json();
    } catch (error) {
      console.error('Error storing memory match metrics:', error);
      throw error;
    }
  },

  // Get cognitive profile for a user
  getCognitiveProfile: async (userId: string): Promise<MemoryMatchProfileResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/metrics/memory-match/profile/${userId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retrieve cognitive profile');
      }

      return response.json();
    } catch (error) {
      console.error('Error retrieving cognitive profile:', error);
      throw error;
    }
  },

  // Test endpoint for development
  testConnection: async (): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ test: true })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to backend');
      }

      return response.json();
    } catch (error) {
      console.error('Error testing backend connection:', error);
      throw error;
    }
  }
}; 