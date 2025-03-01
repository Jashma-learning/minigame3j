import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { GameData, GameSession, CognitiveProfile, UserData, GameScore } from '../types/gameData';

export class GameDataService {
  private dataFilePath: string;
  private data: GameData;

  constructor() {
    this.dataFilePath = path.join(__dirname, '../data/gameData.json');
    this.data = {
      users: {},
      cognitiveProfiles: {},
      userData: {},
      gameScores: [],
      gameProgress: {}
    };
    this.initializeData();
  }

  private async initializeData() {
    try {
      await this.readDataFile();
    } catch (error) {
      console.error('Error initializing data:', error);
      await this.writeDataFile();
    }
  }

  private async readDataFile() {
    try {
      const fileContent = await fs.readFile(this.dataFilePath, 'utf-8');
      this.data = JSON.parse(fileContent);
      // Ensure all required properties exist
      this.data.users = this.data.users || {};
      this.data.cognitiveProfiles = this.data.cognitiveProfiles || {};
      this.data.userData = this.data.userData || {};
      this.data.gameScores = this.data.gameScores || [];
      this.data.gameProgress = this.data.gameProgress || {};
    } catch (error) {
      console.error('Error reading data file:', error);
      throw error;
    }
  }

  private async writeDataFile() {
    try {
      await fs.writeFile(this.dataFilePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error writing data file:', error);
      throw error;
    }
  }

  async storeUserData(userData: UserData): Promise<string> {
    const userId = uuidv4();
    this.data.users[userId] = userData;
    await this.writeDataFile();
    return userId;
  }

  async getUserProfile(userId: string): Promise<UserData | null> {
    await this.readDataFile();
    return this.data.users[userId] || null;
  }

  public storeGameSession(
    userId: string, 
    gameSession: GameSession, 
    cognitiveMetrics: Record<string, number>
  ): void {
    // Initialize cognitive profile if it doesn't exist
    if (!this.data.cognitiveProfiles[userId]) {
      this.data.cognitiveProfiles[userId] = {
        userId,
        strengths: [],
        areas_for_improvement: [],
        recommended_games: [],
        difficulty_levels: {}
      };
    }

    // Store game session in gameScores
    this.data.gameScores.push({
      userId,
      gameId: gameSession.gameId,
      score: gameSession.metrics.score?.value || 0,
      timestamp: gameSession.timestamp,
      difficulty: 'medium' // Default difficulty, can be made dynamic
    });

    // Update cognitive profile
    const profile = this.data.cognitiveProfiles[userId];
    Object.entries(cognitiveMetrics).forEach(([domain, score]) => {
      profile.difficulty_levels[domain] = score > 75 ? 'hard' : score > 50 ? 'medium' : 'easy';
    });

    // Update strengths and areas for improvement
    const sortedMetrics = Object.entries(cognitiveMetrics)
      .sort(([, a], [, b]) => b - a);
    
    profile.strengths = sortedMetrics.slice(0, 3).map(([domain]) => domain);
    profile.areas_for_improvement = sortedMetrics.slice(-3).map(([domain]) => domain);

    // Update game progress
    if (!this.data.gameProgress[userId]) {
      this.data.gameProgress[userId] = {};
    }
    this.data.gameProgress[userId][gameSession.gameId] = {
      level: 1,
      completed: true,
      score: gameSession.metrics.score?.value || 0
    };

    this.writeDataFile();
  }

  public getUserGameData(userId: string): GameScore[] | null {
    const userScores = this.data.gameScores.filter(score => score.userId === userId);
    return userScores.length > 0 ? userScores : null;
  }

  public getGameSpecificData(userId: string, gameId: string): GameScore[] | null {
    const gameScores = this.data.gameScores.filter(
      score => score.userId === userId && score.gameId === gameId
    );
    return gameScores.length > 0 ? gameScores : null;
  }

  public getCognitiveProfile(userId: string): CognitiveProfile | null {
    return this.data.cognitiveProfiles[userId] || null;
  }

  public getAllUsers(): string[] {
    return Object.keys(this.data.users);
  }
} 