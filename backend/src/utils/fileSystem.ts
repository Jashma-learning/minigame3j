import fs from 'fs';
import path from 'path';

// Update the path to be relative to the project root
export const COGNITIVE_DATA_DIR = path.join(process.cwd(), 'data', 'cognitive');

export const ensureCognitiveDirectory = async (): Promise<void> => {
  try {
    console.log('Ensuring cognitive directory exists at:', COGNITIVE_DATA_DIR);
    if (!fs.existsSync(COGNITIVE_DATA_DIR)) {
      console.log('Creating cognitive directory');
      await fs.promises.mkdir(COGNITIVE_DATA_DIR, { recursive: true });
      console.log('Cognitive directory created successfully');
    } else {
      console.log('Cognitive directory already exists');
    }
  } catch (error) {
    console.error('Error ensuring cognitive directory:', error);
    throw error;
  }
}; 