import { GoNoGoMetrics, GoNoGoMetricsResponse, GoNoGoProfileResponse } from '../types/cognitive/goNoGo.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const goNoGoService = {
  // Store metrics for a completed game
  storeMetrics: async (userId: string, metrics: GoNoGoMetrics): Promise<GoNoGoMetricsResponse> => {
    try {
      console.log('Attempting to store metrics:', { userId, metrics });
      
      const response = await fetch(`${API_BASE_URL}/metrics/go-no-go`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ userId, metrics })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to store metrics');
      }

      return data;
    } catch (error) {
      console.error('Error storing go/no-go metrics:', error);
      console.error('API URL used:', `${API_BASE_URL}/metrics/go-no-go`);
      throw error;
    }
  },

  // Get cognitive profile for a user
  getCognitiveProfile: async (userId: string): Promise<GoNoGoProfileResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/metrics/go-no-go/profile/${userId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to retrieve cognitive profile');
      }

      return data;
    } catch (error) {
      console.error('Error retrieving cognitive profile:', error);
      throw error;
    }
  },

  // Test endpoint for development
  testConnection: async (): Promise<{ message: string }> => {
    try {
      console.log('Testing backend connection...');
      const response = await fetch(`${API_BASE_URL}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ test: true })
      });

      console.log('Test response status:', response.status);
      const data = await response.json();
      console.log('Test response data:', data);

      if (!response.ok) {
        throw new Error('Failed to connect to backend');
      }

      return data;
    } catch (error) {
      console.error('Error testing backend connection:', error);
      throw error;
    }
  }
}; 