export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Wall {
  position: Position3D;
  scale: [number, number, number];
}

export type CellType = 'wall' | 'path' | 'collectible' | 'start' | 'end';

export interface MazeCell {
  type: CellType;
  position: Position3D;
}

export interface MazeLevel {
  cells: MazeCell[];
  collectibles: MazeCell[];
  start: Position3D;
  end: Position3D;
  size: {
    width: number;
    height: number;
  };
} 