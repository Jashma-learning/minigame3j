import fs from 'fs';
import path from 'path';
import { GameData, GameSession } from '../types/gameData';

const DATA_FILE_PATH = path.join(__dirname, '../data/gameData.json');

export class GameDataService {
  private data: GameData;

  constructor() {
    this.ensureDataFileExists();
    this.data = this.readDataFile();
  }

  private ensureDataFileExists(): void {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      const initialData: GameData = { users: {} };
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(initialData, null, 2));
    }
  }

  private readDataFile(): GameData {
    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(rawData);
  }

  private writeDataFile(): void {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(this.data, null, 2));
  }

  public storeGameSession(userId: string, gameSession: GameSession): void {
    if (!this.data.users[userId]) {
      this.data.users[userId] = {};
    }

    if (!this.data.users[userId][gameSession.gameId]) {
      this.data.users[userId][gameSession.gameId] = [];
    }

    this.data.users[userId][gameSession.gameId].push(gameSession);
    this.writeDataFile();
  }

  public getUserData(userId: string): Record<string, GameSession[]> | null {
    return this.data.users[userId] || null;
  }

  public getGameData(userId: string, gameId: string): GameSession[] | null {
    return this.data.users[userId]?.[gameId] || null;
  }

  public getAllUsers(): string[] {
    return Object.keys(this.data.users);
  }
} 