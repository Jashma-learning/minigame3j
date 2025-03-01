'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gameSeriesConfig } from '../utils/gameSeriesConfig';
import UserOnboardingForm, { UserData } from '../components/UserOnboardingForm';
import { storeUserData, getUserProfile } from '../services/userService';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const router = useRouter();
  const [showGames, setShowGames] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        setError(null);
        // Get userId from localStorage or create a new one
        const storedUserId = localStorage.getItem('userId');
        const userId = storedUserId || uuidv4();
        
        if (!storedUserId) {
          localStorage.setItem('userId', userId);
        }

        // Try to get existing user profile
        const profile = await getUserProfile(userId);
        if (profile) {
          setUserData(profile);
          setShowGames(true);
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        setError('Failed to load user profile. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    checkExistingUser();
  }, []);

  const handleFormSubmit = async (data: UserData) => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = await storeUserData(data);
      localStorage.setItem('userId', userId);
      
      setUserData(data);
      setShowGames(true);
    } catch (error) {
      console.error('Error storing user data:', error);
      setError('Failed to save your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startGames = () => {
    router.push(`/games?game=${gameSeriesConfig[0].id}`);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <main className="h-full overflow-y-auto">
        <div className="min-h-full flex flex-col items-center bg-gradient-to-b from-blue-50 to-white">
          <div className="w-full max-w-7xl px-4 py-8 md:py-12">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            <div className="text-center space-y-6 mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                Cognitive Assessment Games
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Welcome to our series of cognitive assessment games. Test and improve your cognitive abilities through engaging challenges.
              </p>
            </div>

            {!showGames ? (
              <div className="flex justify-center">
                <UserOnboardingForm onSubmit={handleFormSubmit} />
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <div className="inline-block bg-white px-6 py-4 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold text-gray-900">Welcome, {userData?.name}!</h2>
                    <p className="text-gray-600 mt-1">Your games have been personalized based on your profile.</p>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={startGames}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 px-8 rounded-lg shadow-lg transition-colors"
                    >
                      Start Game Series
                    </button>
                    
                    <p className="text-sm text-gray-500">
                      Complete all games to view your cognitive profile
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min pb-8">
                  {gameSeriesConfig.map((game, index) => (
                    <div 
                      key={game.id} 
                      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{game.name}</h3>
                          <p className="text-gray-600 mb-4">{game.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                              {game.estimatedDuration}
                            </span>
                            <span className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-full">
                              {game.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 