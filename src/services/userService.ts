import { UserData } from '../components/UserOnboardingForm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const storeUserData = async (userData: UserData): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userData }),
      credentials: 'include',
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error('Failed to store user data');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to store user data');
    }

    return result.userId;
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user-profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to get user profile');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to get user profile');
    }

    return result.data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}; 