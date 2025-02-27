export type ShapeType = 'cube' | 'pyramid' | 'lShape' | 'tShape' | 'cross';

export interface ShapeConfig {
  type: ShapeType;
  difficulty: number;
}

export type Rotation = [number, number, number];

export interface ShapeProps {
  shape: ShapeConfig;
  rotation: Rotation;
  speed: number;
  isSilhouette?: boolean;
} 