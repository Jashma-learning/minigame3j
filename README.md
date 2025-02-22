# Cognitive Assessment Memory Game

A React-based memory game designed to assess various cognitive functions in children through engaging gameplay and comprehensive metrics tracking.

## Project Structure

```
src/
├── components/
│   ├── GameWrapper.tsx              # Main game wrapper component
│   └── games/
│       └── MemoryRecall/
│           ├── MemoryRecallGame.tsx # Main game logic and UI
│           ├── Grid.tsx             # Grid system for object placement
│           ├── DistractionGame.tsx  # Firefly mini-game
│           └── CognitiveMetricsCharts.tsx # Visualization of cognitive metrics
├── types/
│   └── game.ts                      # TypeScript interfaces and types
├── utils/
│   └── gameUtils.ts                 # Utility functions for game mechanics
└── app/
    ├── layout.tsx                   # Root layout component
    └── page.tsx                     # Entry point

```

## Component Details

### MemoryRecallGame.tsx
- **Purpose**: Main game orchestrator
- **Key Functions**:
  - `initializeGame()`: Sets up game with 3 random objects
  - `handleObjectPlaced()`: Manages object placement during recall
  - `handleDistractionComplete()`: Transitions from distraction to recall phase
  - `handleSubmit()`: Calculates and displays final metrics

### Grid.tsx
- **Purpose**: Handles the 5x5 grid system
- **Key Features**:
  - Drag and drop functionality
  - Visual feedback for interactions
  - Object position tracking

### DistractionGame.tsx
- **Purpose**: Mini-game to test memory retention
- **Features**:
  - Moving firefly with golden state
  - Score tracking
  - Visual trails and effects
  - Kid-friendly clickable areas

### CognitiveMetricsCharts.tsx
- **Purpose**: Visualizes cognitive assessment results
- **Charts**:
  - Radar Chart: Overall performance
  - Timeline Chart: Object placement speed
  - Accuracy Bar Chart: Placement correctness

## Cognitive Metrics & Scientific Indexing

### 1. Spatial Memory Index (SMI)
```
SMI = (CA × 0.6) + (PD × 0.4)
where:
- CA (Coordinate Accuracy) = Correct positions / Total objects × 100
- PD (Position Distance) = 1 - (Average displacement / Maximum grid distance)
Range: 0-100, Threshold for advancement: >75
```

### 2. Processing Speed Index (PSI)
```
PSI = 100 × (1 - (RT / MTR)) × (1 - (HT / MHT))
where:
- RT (Recall Time) = Total time taken for placement
- MTR (Maximum Target Recall) = 30 seconds
- HT (Hesitation Time) = Time before first move
- MHT (Maximum Hesitation Time) = 10 seconds
Range: 0-100, Threshold for advancement: >70
```

### 3. Attention Span Index (ASI)
```
ASI = (ET × 0.4) + (FC × 0.6)
where:
- ET (Exploration Time Utilization) = Time spent observing / Total available time
- FC (Focus Consistency) = 1 - (Number of incorrect placements / Total attempts)
Range: 0-100, Threshold for advancement: >80
```

### 4. Distraction Resistance Index (DRI)
```
DRI = (DS × 0.5) + (MP × 0.5)
where:
- DS (Distraction Score) = Firefly game score / Maximum possible score
- MP (Memory Preservation) = Correct placements after distraction / Total objects
Range: 0-100, Threshold for advancement: >65
```

### 5. Sequential Memory Index (SEQI)
```
SEQI = (OA × 0.7) + (TP × 0.3)
where:
- OA (Order Accuracy) = Correct sequence placements / Total objects
- TP (Time Pattern) = 1 - (Standard deviation of placement times / Mean placement time)
Range: 0-100, Threshold for advancement: >70
```

### Overall Cognitive Performance Score (OCPS)
```
OCPS = (SMI × 0.25) + (PSI × 0.20) + (ASI × 0.20) + (DRI × 0.15) + (SEQI × 0.20)
Range: 0-100
```

## Level Progression System

### Level Structure
1. **Level 1-3: Basic Memory (Current Implementation)**
   - 3 objects, 5×5 grid
   - 5 seconds memorization
   - Standard distraction game

2. **Level 4-6: Enhanced Complexity**
   - 4 objects, 6×6 grid
   - 4 seconds memorization
   - Faster firefly movement

3. **Level 7-9: Advanced Memory**
   - 5 objects, 7×7 grid
   - 3 seconds memorization
   - Multiple golden fireflies

4. **Level 10+: Expert Challenge**
   - 6+ objects, 8×8 grid
   - 2 seconds memorization
   - Complex distraction patterns

### Advancement Criteria
```
Level Up Requirements:
1. OCPS > 75 for current level
2. Minimum 3 attempts at current level
3. All individual indices above their thresholds
4. Consistent performance (Standard deviation < 15%)
```

### Difficulty Scaling
```
For each level:
- Grid Size = 5 + floor(level/3)
- Object Count = 3 + floor(level/3)
- Memorization Time = max(2, 5 - floor(level/3))
- Distraction Complexity = 1 + (level * 0.2)
```

## Game Flow

1. **Start Phase**
   - Welcome screen
   - Game initialization

2. **Exploration Phase**
   - 5-second memorization period
   - Display of 3 objects in grid

3. **Distraction Phase**
   - Firefly catching mini-game
   - Score tracking

4. **Recall Phase**
   - Drag-and-drop object placement
   - No immediate feedback

5. **Results Phase**
   - Comprehensive metrics display
   - Visual data representation
   - Performance analysis

## Technical Implementation

### State Management
- React useState for game state
- Metric tracking systems
- Phase transitions

### Interactions
- Drag and drop API
- Touch-friendly controls
- Responsive design

### Visualization
- Recharts library for metrics
- Interactive tooltips
- Responsive containers

## Future Goals

### Short-term
1. [ ] Add sound effects and visual feedback
2. [ ] Implement progressive difficulty levels
3. [ ] Add tutorial mode for first-time users
4. [ ] Save and track progress over time

### Medium-term
1. [ ] Add more mini-games for different cognitive aspects
2. [ ] Implement user profiles and progress tracking
3. [ ] Add comparative analytics
4. [ ] Create a parent/teacher dashboard

### Long-term
1. [ ] Develop AI-driven difficulty adjustment
2. [ ] Add multiplayer/competitive modes
3. [ ] Create detailed cognitive development reports
4. [ ] Integrate with educational platforms

## Installation and Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Dependencies

- Next.js
- React
- Recharts
- Tailwind CSS

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

MIT License - See LICENSE file for details
